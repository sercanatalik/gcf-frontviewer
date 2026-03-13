import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { F, IDENTIFIER_RE } from "@/lib/field-defs"
import { parseFilters, whereString, resolveParam, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupBy = resolveParam(searchParams, "groupBy", F.counterpartyParentName)
  const field = resolveParam(searchParams, "field", F.fundingAmount)
  const topN = Math.min(Math.max(Number(searchParams.get("topN") || "10"), 1), 50)
  const filtersJson = searchParams.get("filters") || ""

  if (!IDENTIFIER_RE.test(groupBy) || !IDENTIFIER_RE.test(field)) {
    return NextResponse.json({ error: "Invalid parameter" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { clauses, params } = parseFilters(filtersJson)
    const whereStr = whereString(clauses)

    const query = `
      WITH
        grp AS (
          SELECT
            ${groupBy} AS name,
            sum(toFloat64OrZero(toString(${field}))) AS exposure
          FROM gcf_risk_mv FINAL
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

    const topQuery = `
      WITH grp AS (
        SELECT
          ${groupBy} AS name,
          sum(toFloat64OrZero(toString(${field}))) AS exposure
        FROM gcf_risk_mv FINAL
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

    const qp = { ...params, topN }
    const [summaryResult, topResult] = await Promise.all([
      client.query({ query, query_params: qp, format: "JSONEachRow" }),
      client.query({ query: topQuery, query_params: qp, format: "JSONEachRow" }),
    ])

    const [summary] = (await summaryResult.json()) as Array<{ total: number; hhi: number; topNShare: number; groupCount: number }>
    const topRows = (await topResult.json()) as Array<{ name: string; exposure: number; share: number }>

    return cacheJson({
      total: Number(summary?.total) || 0,
      hhi: Number(summary?.hhi) || 0,
      topNShare: Number(summary?.topNShare) || 0,
      groupCount: Number(summary?.groupCount) || 0,
      topN,
      items: topRows.map((r) => ({ name: r.name, exposure: Number(r.exposure), share: Number(r.share) })),
    })
  } catch (error) {
    return errorJson("Concentration error", error)
  }
}
