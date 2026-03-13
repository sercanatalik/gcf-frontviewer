import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { F } from "@/lib/field-defs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filtersJson = searchParams.get("filters") || ""
  const groupBy = searchParams.get("groupBy") || F.counterpartyParentName
  const field = searchParams.get("field") || F.fundingAmount
  const topN = Math.min(Math.max(Number(searchParams.get("topN") || "10"), 1), 50)

  const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/
  if (!IDENTIFIER_RE.test(groupBy) || !IDENTIFIER_RE.test(field)) {
    return NextResponse.json({ error: "Invalid parameter" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    if (!hasAsofDate) {
      clauses.push("asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    }
    const whereStr = `WHERE ${clauses.join(" AND ")}`

    // Single query: per-group exposures + total + HHI + top-N concentration
    const query = `
      WITH
        grp AS (
          SELECT
            ${groupBy} AS name,
            sum(toFloat64OrZero(toString(${field}))) AS exposure
          FROM gcf_risk_mv
          ${whereStr}
          GROUP BY ${groupBy}
          HAVING exposure != 0
          ORDER BY exposure DESC
        ),
        totals AS (
          SELECT
            sum(exposure) AS total,
            sum(pow(exposure / nullIf(s.t, 0), 2)) AS hhi
          FROM grp, (SELECT sum(exposure) AS t FROM grp) AS s
        ),
        topN AS (
          SELECT sum(exposure) AS topSum
          FROM (SELECT exposure FROM grp ORDER BY exposure DESC LIMIT {topN:UInt32})
        )
      SELECT
        (SELECT total FROM totals) AS total,
        (SELECT hhi FROM totals) AS hhi,
        (SELECT topSum / nullIf((SELECT total FROM totals), 0) FROM topN) AS topNShare,
        (SELECT count() FROM grp) AS groupCount
    `

    const summaryResult = await client.query({
      query,
      query_params: { ...params, topN },
      format: "JSONEachRow",
    })
    const [summary] = (await summaryResult.json()) as Array<{
      total: number
      hhi: number
      topNShare: number
      groupCount: number
    }>

    // Top counterparties with share
    const topQuery = `
      WITH grp AS (
        SELECT
          ${groupBy} AS name,
          sum(toFloat64OrZero(toString(${field}))) AS exposure
        FROM gcf_risk_mv
        ${whereStr}
        GROUP BY ${groupBy}
        HAVING exposure != 0
        ORDER BY exposure DESC
      ),
      t AS (SELECT sum(exposure) AS total FROM grp)
      SELECT
        name,
        exposure,
        exposure / nullIf((SELECT total FROM t), 0) AS share
      FROM grp
      ORDER BY exposure DESC
      LIMIT {topN:UInt32}
    `

    const topResult = await client.query({
      query: topQuery,
      query_params: { ...params, topN },
      format: "JSONEachRow",
    })
    const topRows = (await topResult.json()) as Array<{
      name: string
      exposure: number
      share: number
    }>

    return NextResponse.json(
      {
        total: Number(summary?.total) || 0,
        hhi: Number(summary?.hhi) || 0,
        topNShare: Number(summary?.topNShare) || 0,
        groupCount: Number(summary?.groupCount) || 0,
        topN,
        items: topRows.map((r) => ({
          name: r.name,
          exposure: Number(r.exposure),
          share: Number(r.share),
        })),
      },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
    )
  } catch (error) {
    console.error("Concentration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
