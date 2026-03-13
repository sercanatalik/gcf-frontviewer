import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { buildAggExpr, F } from "@/lib/field-defs"

interface KpiMeasure {
  key: string
  field: string
  aggregation: string
  weightField?: string
}

function aliasFor(key: string): string {
  return `v_${key}`
}

function buildKpiAggExpr(m: KpiMeasure): string {
  return buildAggExpr(m.field, m.aggregation, {
    weightField: m.weightField,
    alias: aliasFor(m.key),
  })
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

  let measures: KpiMeasure[]
  try {
    measures = JSON.parse(measuresJson)
  } catch {
    return NextResponse.json({ error: "invalid measures JSON" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()

    // Build filter clauses
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    // Separate asOfDate clause from other filters so we can use it in the CTE
    const nonAsofClauses = hasAsofDate
      ? clauses.filter((c) => !c.includes(F.asofDate))
      : clauses
    const asofClause = hasAsofDate
      ? clauses.find((c) => c.includes(F.asofDate))
      : null

    const filterWhere = nonAsofClauses.length > 0 ? ` AND ${nonAsofClauses.join(" AND ")}` : ""
    const aggExprs = measures.map(buildKpiAggExpr).join(", ")

    // If user provided an asOfDate filter, use it to determine the current date;
    // otherwise default to the max available date.
    const latestDateExpr = hasAsofDate && asofClause
      ? `SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv WHERE ${asofClause}`
      : `SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv`

    const query = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv WHERE ${F.asofDate} <= (SELECT d FROM latestDate) - toIntervalDay({relativeDays:UInt32}))
      SELECT
        'current' AS period, ${aggExprs}
      FROM gcf_risk_mv
      WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
      UNION ALL
      SELECT
        'previous' AS period, ${aggExprs}
      FROM gcf_risk_mv
      WHERE ${F.asofDate} = (SELECT d FROM prevDate)${filterWhere}
    `

    const result = await client.query({
      query,
      query_params: { relativeDays, ...params },
      format: "JSONEachRow",
    })

    const rows = (await result.json()) as Array<Record<string, unknown>>
    const currentRow = rows.find((r) => r.period === "current") || {}
    const previousRow = rows.find((r) => r.period === "previous") || {}

    const data: Record<
      string,
      { current: number; previous: number; change: number; changePercent: number }
    > = {}

    for (const m of measures) {
      const alias = aliasFor(m.key)
      const current = Number(currentRow[alias]) || 0
      const previous = Number(previousRow[alias]) || 0
      const change = current - previous
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0
      data[m.key] = { current, previous, change, changePercent }
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("KPI summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
