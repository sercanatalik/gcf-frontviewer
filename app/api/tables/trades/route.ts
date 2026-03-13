import { NextRequest } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { TRADE_SELECT_EXPR, SEARCH_COLUMNS, SORTABLE_COLUMNS, F } from "@/lib/field-defs"
import { parseFilters, whereString, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || "25"), 200)
  const offset = Math.max(Number(searchParams.get("offset") || "0"), 0)
  const search = (searchParams.get("search") || "").trim()
  const sortBy = searchParams.get("sortBy") || F.tradeDt
  const sortDir = searchParams.get("sortDir") === "asc" ? "ASC" : "DESC"
  const sideFilter = searchParams.get("side") || ""
  const filtersJson = searchParams.get("filters") || ""

  try {
    const { clauses, params } = parseFilters(filtersJson, { tablePrefix: "gcf_risk_mv" })

    if (search) {
      const searchClauses = SEARCH_COLUMNS.map((col) => `gcf_risk_mv.${col} ILIKE {p_search:String}`)
      clauses.push(`(${searchClauses.join(" OR ")})`)
      params.p_search = `%${search}%`
    }

    if (sideFilter && (sideFilter === "PAY" || sideFilter === "RECEIVE")) {
      clauses.push(`gcf_risk_mv.${F.side} = {p_side:String}`)
      params.p_side = sideFilter
    }

    const whereStr = whereString(clauses)
    const sortCol = SORTABLE_COLUMNS[sortBy] || F.tradeDt

    const countQuery = `SELECT count() AS total FROM gcf_risk_mv FINAL ${whereStr}`
    const dataQuery = `
      SELECT ${TRADE_SELECT_EXPR}
      FROM gcf_risk_mv FINAL
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

    return cacheJson({ rows, total, limit, offset })
  } catch (error) {
    return errorJson("Error fetching trades", error)
  }
}
