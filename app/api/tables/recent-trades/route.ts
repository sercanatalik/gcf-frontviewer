import { NextRequest } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { TRADE_SELECT_EXPR, F } from "@/lib/field-defs"
import { parseFilters, whereString, cacheJson, errorJson } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 200)
  const sortMode = searchParams.get("sort") === "maturity" ? "maturity" : "recent"
  const sort = sortMode === "maturity" ? `${F.maturityDt} ASC` : `${F.tradeDt} DESC`
  const relativeDt = Math.min(Math.max(Number(searchParams.get("relativeDt") || "30"), 1), 365)
  const filtersJson = searchParams.get("filters") || ""

  try {
    const { clauses, params } = parseFilters(filtersJson, { tablePrefix: "gcf_risk_mv" })

    // Exclude trades with zero cash out
    clauses.push(`toFloat64OrZero(toString(gcf_risk_mv.${F.cashOut})) != 0`)

    // Date window: for maturity mode, only future maturities within N days
    if (sortMode === "maturity") {
      clauses.push(`gcf_risk_mv.${F.maturityDt} >= gcf_risk_mv.${F.asofDate}`)
      clauses.push(`gcf_risk_mv.${F.maturityDt} <= gcf_risk_mv.${F.asofDate} + toIntervalDay(${relativeDt})`)
    }

    const query = `
      SELECT ${TRADE_SELECT_EXPR}
      FROM gcf_risk_mv FINAL
      ${whereString(clauses)}
      ORDER BY ${sort}
      LIMIT ${limit}
    `

    const client = getClickHouseClient()
    const result = await client.query({ query, query_params: params, format: "JSONEachRow" })
    return cacheJson(await result.json())
  } catch (error) {
    return errorJson("Error fetching recent trades", error)
  }
}
