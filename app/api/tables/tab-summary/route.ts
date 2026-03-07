import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"

const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

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
    const { clauses, params } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    clauses.push("asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    const whereStr = `WHERE ${clauses.join(" AND ")}`

    const query = `
      SELECT
        ${groupBy} AS group,
        count() AS trades,
        sum(toFloat64OrZero(toString(cashOut))) AS cash_out,
        sum(toFloat64OrZero(toString(fundingAmount))) AS funding_amount,
        sum(toFloat64OrZero(toString(collateralAmount))) AS collateral_amount,
        sum(toFloat64OrZero(toString(fundingMargin)) * toFloat64OrZero(toString(fundingAmount)))
          / nullIf(sum(toFloat64OrZero(toString(fundingAmount))), 0) AS avg_spread,
        avg(toFloat64OrZero(toString(dtm))) AS avg_dtm
      FROM gcf_risk_mv
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
