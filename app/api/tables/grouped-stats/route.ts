import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildAggExpr, IDENTIFIER_RE } from "@/lib/field-defs"
import { parseFilters, whereString, resolveParam, resolveOptionalParam, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const field = resolveParam(searchParams, "field", "")
  const aggregation = searchParams.get("aggregation") || "sum"
  const groupBy = resolveParam(searchParams, "groupBy", "")
  const weightField = resolveOptionalParam(searchParams, "weightField")
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "8"), 1), 50)
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
    const { clauses, params } = parseFilters(filtersJson)
    const whereStr = whereString(clauses)

    let aggExpr: string
    try {
      aggExpr = buildAggExpr(field, aggregation, { weightField })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }

    const query = `
      WITH ranked AS (
        SELECT
          ${groupBy} AS grp,
          ${aggExpr} AS value
        FROM gcf_risk_mv FINAL
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

    const result = await client.query({ query, query_params: { ...params, limit }, format: "JSONEachRow" })
    return cacheJson(await result.json())
  } catch (error) {
    return errorJson("Grouped stats error", error)
  }
}
