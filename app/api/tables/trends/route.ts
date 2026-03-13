import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { ALLOWED_TIME_FIELDS, ALLOWED_AGGREGATIONS, buildAggExpr, F, IDENTIFIER_RE } from "@/lib/field-defs"
import { parseFilters, whereString, resolveParam, resolveOptionalParam, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const field = resolveParam(searchParams, "field", F.fundingAmount)
  const aggregation = searchParams.get("aggregation") || "sum"
  const weightField = resolveOptionalParam(searchParams, "weightField")
  const timeField = ALLOWED_TIME_FIELDS[searchParams.get("timeField") || F.tradeDt] || F.tradeDt
  const groupBy = resolveOptionalParam(searchParams, "groupBy")
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
    const { clauses, params } = parseFilters(filtersJson, { tablePrefix: "gcf_risk_mv" })
    const whereStr = whereString(clauses)

    let aggExpr: string
    try {
      aggExpr = buildAggExpr(field, aggregation, { weightField })
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 })
    }

    if (!groupBy) {
      const query = `
        SELECT formatDateTime(${timeField}, '%Y-%m-%d') AS dt, ${aggExpr} AS value
        FROM gcf_risk_mv FINAL ${whereStr}
        GROUP BY dt ORDER BY dt
      `
      const result = await client.query({ query, query_params: params, format: "JSONEachRow" })
      return cacheJson(
        { data: await result.json(), meta: { field, aggregation, timeField, groupBy: null } },
        120,
      )
    }

    // Find top N groups
    const topQuery = `
      SELECT ${groupBy} AS grp, abs(${aggExpr}) AS total
      FROM gcf_risk_mv FINAL ${whereStr}
      GROUP BY ${groupBy} ORDER BY total DESC LIMIT {topN:UInt32}
    `
    const topResult = await client.query({ query: topQuery, query_params: { ...params, topN }, format: "JSONEachRow" })
    const topGroups = (await topResult.json()) as { grp: string; total: number }[]
    const groupNames = topGroups.map((g) => g.grp).filter(Boolean)

    if (groupNames.length === 0) {
      return cacheJson({ data: [], meta: { field, aggregation, timeField, groupBy, groups: [] } }, 120)
    }

    const caseParts = groupNames.map((_, i) => `WHEN ${groupBy} = {g${i}:String} THEN {g${i}:String}`).join(" ")
    const groupParams: Record<string, string> = {}
    groupNames.forEach((name, i) => { groupParams[`g${i}`] = name })

    const query = `
      SELECT formatDateTime(${timeField}, '%Y-%m-%d') AS dt, CASE ${caseParts} ELSE 'Others' END AS grp, ${aggExpr} AS value
      FROM gcf_risk_mv FINAL ${whereStr}
      GROUP BY dt, grp ORDER BY dt, grp
    `
    const result = await client.query({ query, query_params: { ...params, ...groupParams }, format: "JSONEachRow" })
    return cacheJson(
      { data: await result.json(), meta: { field, aggregation, timeField, groupBy, groups: [...groupNames, "Others"] } },
      120,
    )
  } catch (error) {
    return errorJson("Trends API error", error)
  }
}
