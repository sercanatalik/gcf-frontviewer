import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { splitAsofDateClauses, buildLatestDateExpr } from "@/lib/filters/serialize"
import { buildAggExpr, F } from "@/lib/field-defs"
import { parseFilters, cacheJson, errorJson } from "@/lib/api-utils"

interface KpiMeasure {
  key: string
  field: string
  aggregation: string
  weightField?: string
}

function aliasFor(key: string): string {
  return `v_${key}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const measuresJson = searchParams.get("measures")
  const relativeDays = Math.min(Math.max(Number(searchParams.get("relativeDays") || "180"), 1), 365)
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
    const { clauses, params, hasAsofDate } = parseFilters(filtersJson, { skipDefaultAsof: true })
    const { asofClause, filterWhere } = splitAsofDateClauses(clauses, hasAsofDate)
    const latestDateExpr = buildLatestDateExpr(asofClause, hasAsofDate)
    const aggExprs = measures.map((m) =>
      buildAggExpr(m.field, m.aggregation, { weightField: m.weightField, alias: aliasFor(m.key) }),
    ).join(", ")

    const query = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (SELECT max(${F.asOfDate}) AS d FROM gcf_risk_mv FINAL WHERE ${F.asOfDate} <= (SELECT d FROM latestDate) - toIntervalDay({relativeDays:UInt32}))
      SELECT
        'current' AS period, ${aggExprs}
      FROM gcf_risk_mv FINAL
      WHERE ${F.asOfDate} = (SELECT d FROM latestDate)${filterWhere}
      UNION ALL
      SELECT
        'previous' AS period, ${aggExprs}
      FROM gcf_risk_mv FINAL
      WHERE ${F.asOfDate} = (SELECT d FROM prevDate)${filterWhere}
    `

    const result = await client.query({ query, query_params: { relativeDays, ...params }, format: "JSONEachRow" })
    const rows = (await result.json()) as Array<Record<string, unknown>>
    const currentRow = rows.find((r) => r.period === "current") || {}
    const previousRow = rows.find((r) => r.period === "previous") || {}

    const data: Record<string, { current: number; previous: number; change: number; changePercent: number }> = {}
    for (const m of measures) {
      const alias = aliasFor(m.key)
      const current = Number(currentRow[alias]) || 0
      const previous = Number(previousRow[alias]) || 0
      const change = current - previous
      const changePercent = previous !== 0 ? (change / previous) * 100 : 0
      data[m.key] = { current, previous, change, changePercent }
    }

    return cacheJson(data)
  } catch (error) {
    return errorJson("KPI summary error", error)
  }
}
