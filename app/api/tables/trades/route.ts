import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { TRADE_SELECT_EXPR } from "@/lib/columns"

const SEARCH_COLUMNS = [
  "counterParty",
  "collateralDesc",
  "ticker",
  "hmsDesk",
  "productType",
  "tradeId",
  "issuerName",
  "region",
  "isinId",
  "counterpartyParentName",
]

const SORTABLE_COLUMNS: Record<string, string> = {
  tradeDt: "tradeDt",
  maturityDt: "maturityDt",
  fundingAmount: "fundingAmount",
  collateralAmount: "collateralAmount",
  counterParty: "counterParty",
  hmsDesk: "hmsDesk",
  fundingMargin: "fundingMargin",
  cashOut: "cashOut",
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || "25"), 200)
  const offset = Math.max(Number(searchParams.get("offset") || "0"), 0)
  const search = (searchParams.get("search") || "").trim()
  const sortBy = searchParams.get("sortBy") || "tradeDt"
  const sortDir = searchParams.get("sortDir") === "asc" ? "ASC" : "DESC"
  const sideFilter = searchParams.get("side") || ""
  const filtersJson = searchParams.get("filters") || ""

  try {
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    if (!hasAsofDate) {
      clauses.push("gcf_risk_mv.asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    }

    // Search across multiple text columns
    if (search) {
      const searchClauses = SEARCH_COLUMNS.map(
        (col) => `gcf_risk_mv.${col} ILIKE {p_search:String}`,
      )
      clauses.push(`(${searchClauses.join(" OR ")})`)
      params.p_search = `%${search}%`
    }

    // Side filter
    if (sideFilter && (sideFilter === "PAY" || sideFilter === "RECEIVE")) {
      clauses.push("gcf_risk_mv.side = {p_side:String}")
      params.p_side = sideFilter
    }

    const whereStr = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""
    const sortCol = SORTABLE_COLUMNS[sortBy] || "tradeDt"

    // Count query
    const countQuery = `SELECT count() AS total FROM gcf_risk_mv ${whereStr}`

    // Data query
    const dataQuery = `
      SELECT ${TRADE_SELECT_EXPR}
      FROM gcf_risk_mv
      ${whereStr}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT {p_limit:UInt32}
      OFFSET {p_offset:UInt32}
    `

    const client = getClickHouseClient()
    const dataParams = { ...params, p_limit: limit, p_offset: offset }
    const [countResult, dataResult] = await Promise.all([
      client.query({ query: countQuery, query_params: params, format: "JSONEachRow" }),
      client.query({ query: dataQuery, query_params: dataParams, format: "JSONEachRow" }),
    ])

    const [countRows, rows] = await Promise.all([countResult.json(), dataResult.json()])
    const total = (countRows as { total: number }[])[0]?.total ?? 0

    return NextResponse.json(
      { rows, total, limit, offset },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
    )
  } catch (error) {
    console.error("Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
