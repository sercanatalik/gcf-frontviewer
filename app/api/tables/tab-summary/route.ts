import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { F, TAB_SUMMARY_MEASURES, IDENTIFIER_RE } from "@/lib/field-defs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupBy = searchParams.get("groupBy")
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || "10"), 1),
    50,
  )
  const filtersJson = searchParams.get("filters") || ""

  if (!groupBy || !IDENTIFIER_RE.test(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    if (!hasAsofDate) {
      clauses.push(`${F.asofDate} = (SELECT max(${F.asofDate}) FROM gcf_risk_mv FINAL)`)
    }
    const whereStr = `WHERE ${clauses.join(" AND ")}`

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

    const result = await client.query({
      query,
      query_params: { ...params, limit },
      format: "JSONEachRow",
    })
    const rows = (await result.json()) as Array<{
      group: string
      trades: number
      cash_out: number
      funding_amount: number
      collateral_amount: number
      avg_spread: number | null
      avg_dtm: number | null
    }>

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("Tab summary error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
