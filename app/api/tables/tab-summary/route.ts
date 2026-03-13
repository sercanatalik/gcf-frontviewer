import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { TAB_SUMMARY_MEASURES, IDENTIFIER_RE } from "@/lib/field-defs"
import { parseFilters, whereString, resolveParam, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupBy = resolveParam(searchParams, "groupBy", "")
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "10"), 1), 50)
  const filtersJson = searchParams.get("filters") || ""

  if (!groupBy || !IDENTIFIER_RE.test(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { clauses, params } = parseFilters(filtersJson)
    const whereStr = whereString(clauses)
    const m = TAB_SUMMARY_MEASURES

    const query = `
      SELECT
        ${groupBy} AS group,
        count() AS trades,
        sum(toFloat64OrZero(toString(${m.cashOut}))) AS cash_out,
        sum(toFloat64OrZero(toString(${m.fundingAmount}))) AS funding_amount,
        sum(toFloat64OrZero(toString(${m.collateralAmount}))) AS collateral_amount,
        sum(toFloat64OrZero(toString(${m.fundingMargin})) * toFloat64OrZero(toString(${m.fundingAmount})))
          / nullIf(sum(toFloat64OrZero(toString(${m.fundingAmount}))), 0) AS avg_spread,
        avg(toFloat64OrZero(toString(${m.dtm}))) AS avg_dtm
      FROM gcf_risk_mv FINAL
      ${whereStr}
      GROUP BY ${groupBy}
      ORDER BY funding_amount DESC
      LIMIT {limit:UInt32}
    `

    const result = await client.query({ query, query_params: { ...params, limit }, format: "JSONEachRow" })
    return cacheJson(await result.json())
  } catch (error) {
    return errorJson("Tab summary error", error)
  }
}
