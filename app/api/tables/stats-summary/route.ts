import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { buildAggExpr, F } from "@/lib/field-defs"

interface StatMeasure {
  key: string
  field: string
  aggregation: string
}

function aliasFor(key: string): string {
  return `v_${key}`
}

function buildStatAggExpr(m: StatMeasure): string {
  return buildAggExpr(m.field, m.aggregation, { alias: aliasFor(m.key) })
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

    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    const nonAsofClauses = hasAsofDate
      ? clauses.filter((c) => !c.includes(F.asofDate))
      : clauses
    const asofClause = hasAsofDate
      ? clauses.find((c) => c.includes(F.asofDate))
      : null

    const filterWhere = nonAsofClauses.length > 0 ? ` AND ${nonAsofClauses.join(" AND ")}` : ""
    const aggExprs = measures.map(buildStatAggExpr).join(", ")

    const latestDateExpr = hasAsofDate && asofClause
      ? `SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv FINAL WHERE ${asofClause}`
      : `SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv FINAL`

    const query = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (SELECT max(${F.asofDate}) AS d FROM gcf_risk_mv FINAL WHERE ${F.asofDate} <= (SELECT d FROM latestDate) - toIntervalDay({relativeDays:UInt32}))
      SELECT
        'current' AS period, ${aggExprs}
      FROM gcf_risk_mv FINAL
      WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
      UNION ALL
      SELECT
        'previous' AS period, ${aggExprs}
      FROM gcf_risk_mv FINAL
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
