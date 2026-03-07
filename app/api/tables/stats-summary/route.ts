import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"

interface StatMeasure {
  key: string
  field: string
  aggregation: "countDistinct" | "count"
}

function aliasFor(key: string): string {
  return `v_${key}`
}

function buildAggExpr(m: StatMeasure): string {
  const alias = aliasFor(m.key)
  if (m.aggregation === "countDistinct") {
    return `countDistinct(${m.field}) as ${alias}`
  }
  return `count(${m.field}) as ${alias}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const measuresJson = searchParams.get("measures")
  const relativeDays = Math.min(
    Math.max(Number(searchParams.get("relativeDays") || "180"), 1),
    365,
  )
  const filtersJson = searchParams.get("filters") || ""

  if (!measuresJson) {
    return NextResponse.json({ error: "measures param required" }, { status: 400 })
  }

  let measures: StatMeasure[]
  try {
    measures = JSON.parse(measuresJson)
  } catch {
    return NextResponse.json({ error: "invalid measures JSON" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()

    const { clauses, params } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    const filterWhere = clauses.length > 0 ? ` AND ${clauses.join(" AND ")}` : ""
    const aggExprs = measures.map(buildAggExpr).join(", ")

    const query = `
      WITH
        latestDate AS (SELECT max(asofDate) AS d FROM gcf_risk_mv),
        prevDate AS (SELECT max(asofDate) AS d FROM gcf_risk_mv WHERE asofDate <= (SELECT d FROM latestDate) - toIntervalDay({relativeDays:UInt32}))
      SELECT
        'current' AS period, ${aggExprs}
      FROM gcf_risk_mv
      WHERE asofDate = (SELECT d FROM latestDate)${filterWhere}
      UNION ALL
      SELECT
        'previous' AS period, ${aggExprs}
      FROM gcf_risk_mv
      WHERE asofDate = (SELECT d FROM prevDate)${filterWhere}
    `

    const result = await client.query({
      query,
      query_params: { relativeDays, ...params },
      format: "JSONEachRow",
    })

    const rows = (await result.json()) as Array<Record<string, unknown>>
    const currentRow = rows.find((r) => r.period === "current") || {}
    const previousRow = rows.find((r) => r.period === "previous") || {}

    const data: Record<string, { current: number; previous: number; delta: number }> = {}

    for (const m of measures) {
      const alias = aliasFor(m.key)
      const current = Number(currentRow[alias]) || 0
      const previous = Number(previousRow[alias]) || 0
      const delta = current - previous
      data[m.key] = { current, previous, delta }
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("Stats summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
