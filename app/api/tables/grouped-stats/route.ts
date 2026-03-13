import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { buildAggExpr, F } from "@/lib/field-defs"

const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const field = searchParams.get("field")
  const aggregation = searchParams.get("aggregation") || "sum"
  const groupBy = searchParams.get("groupBy")
  const weightField = searchParams.get("weightField") || undefined
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || "8"), 1),
    50,
  )
  const filtersJson = searchParams.get("filters") || ""

  if (!field || !IDENTIFIER_RE.test(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 })
  }
  if (!groupBy || !IDENTIFIER_RE.test(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  }
  if (weightField && !IDENTIFIER_RE.test(weightField)) {
    return NextResponse.json({ error: "Invalid weightField" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    if (!hasAsofDate) {
      clauses.push(`${F.asofDate} = (SELECT max(${F.asofDate}) FROM gcf_risk_mv)`)
    }
    const whereStr = `WHERE ${clauses.join(" AND ")}`

    let aggExpr: string
    try {
      aggExpr = buildAggExpr(field, aggregation, { weightField })
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 },
      )
    }

    const query = `
      WITH ranked AS (
        SELECT
          ${groupBy} AS grp,
          ${aggExpr} AS value
        FROM gcf_risk_mv
        ${whereStr}
        GROUP BY ${groupBy}
        ORDER BY value DESC
      )
      SELECT
        if(rn <= {limit:UInt32}, grp, 'Others') AS group,
        sum(value) AS value
      FROM (
        SELECT *, row_number() OVER (ORDER BY value DESC) AS rn
        FROM ranked
      )
      GROUP BY group
      ORDER BY if(group = 'Others', 0, 1) DESC, value DESC
    `

    const result = await client.query({
      query,
      query_params: { ...params, limit },
      format: "JSONEachRow",
    })
    const rows = (await result.json()) as Array<{
      group: string
      value: number
    }>

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("Grouped stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
