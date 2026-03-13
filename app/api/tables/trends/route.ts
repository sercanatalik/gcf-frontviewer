import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { ALLOWED_TIME_FIELDS, ALLOWED_AGGREGATIONS, buildAggExpr, F } from "@/lib/field-defs"

const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

/**
 * Trends API: time-series data grouped by a date column (tradeDt by default),
 * optionally broken down by a dimension.
 *
 * Query params:
 *   field       - metric field (e.g. fundingAmount, cashOut)
 *   aggregation - sum | avg | count | countDistinct | avgBy
 *   weightField - required for avgBy
 *   timeField   - date column for x-axis (tradeDt | startDt | maturityDt), default tradeDt
 *   groupBy     - optional dimension (e.g. collatCurrency, hmsDesk)
 *   topN        - max groups to show (rest rolled into "Others"), default 5
 *   filters     - serialized filters JSON
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const field = searchParams.get("field") || F.fundingAmount
  const aggregation = searchParams.get("aggregation") || "sum"
  const weightField = searchParams.get("weightField") || undefined
  const timeField = ALLOWED_TIME_FIELDS[searchParams.get("timeField") || F.tradeDt] || F.tradeDt
  const groupBy = searchParams.get("groupBy") || undefined
  const topN = Math.min(Math.max(Number(searchParams.get("topN") || "5"), 1), 20)
  const filtersJson = searchParams.get("filters") || ""

  if (!IDENTIFIER_RE.test(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 })
  }
  if (!(ALLOWED_AGGREGATIONS as readonly string[]).includes(aggregation)) {
    return NextResponse.json({ error: "Invalid aggregation" }, { status: 400 })
  }
  if (groupBy && !IDENTIFIER_RE.test(groupBy)) {
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

    // Scope to latest asofDate so we work with a single snapshot
    if (!hasAsofDate) {
      clauses.push("gcf_risk_mv.asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    }

    const whereStr = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""

    let aggExpr: string
    try {
      aggExpr = buildAggExpr(field, aggregation, { weightField })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }

    if (!groupBy) {
      // Simple time series: one value per date bucket
      const query = `
        SELECT
          formatDateTime(${timeField}, '%Y-%m-%d') AS dt,
          ${aggExpr} AS value
        FROM gcf_risk_mv
        ${whereStr}
        GROUP BY dt
        ORDER BY dt
      `
      const result = await client.query({ query, query_params: params, format: "JSONEachRow" })
      const rows = await result.json()

      return NextResponse.json(
        { data: rows, meta: { field, aggregation, timeField, groupBy: null } },
        { headers: { "Cache-Control": "public, max-age=120, s-maxage=120" } },
      )
    }

    // Grouped time series: first find top N groups by total absolute value
    const topQuery = `
      SELECT ${groupBy} AS grp, abs(${aggExpr}) AS total
      FROM gcf_risk_mv
      ${whereStr}
      GROUP BY ${groupBy}
      ORDER BY total DESC
      LIMIT {topN:UInt32}
    `
    const topResult = await client.query({
      query: topQuery,
      query_params: { ...params, topN },
      format: "JSONEachRow",
    })
    const topGroups = (await topResult.json()) as { grp: string; total: number }[]
    const groupNames = topGroups.map((g) => g.grp).filter(Boolean)

    if (groupNames.length === 0) {
      return NextResponse.json(
        { data: [], meta: { field, aggregation, timeField, groupBy, groups: [] } },
        { headers: { "Cache-Control": "public, max-age=120, s-maxage=120" } },
      )
    }

    // Build CASE expression to bucket into top groups + Others
    const caseParts = groupNames
      .map((_, i) => `WHEN ${groupBy} = {g${i}:String} THEN {g${i}:String}`)
      .join(" ")
    const caseExpr = `CASE ${caseParts} ELSE 'Others' END`

    const groupParams: Record<string, string> = {}
    groupNames.forEach((name, i) => {
      groupParams[`g${i}`] = name
    })

    const query = `
      SELECT
        formatDateTime(${timeField}, '%Y-%m-%d') AS dt,
        ${caseExpr} AS grp,
        ${aggExpr} AS value
      FROM gcf_risk_mv
      ${whereStr}
      GROUP BY dt, grp
      ORDER BY dt, grp
    `

    const result = await client.query({
      query,
      query_params: { ...params, ...groupParams },
      format: "JSONEachRow",
    })
    const rows = await result.json()

    return NextResponse.json(
      { data: rows, meta: { field, aggregation, timeField, groupBy, groups: [...groupNames, "Others"] } },
      { headers: { "Cache-Control": "public, max-age=120, s-maxage=120" } },
    )
  } catch (error) {
    console.error("Trends API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
