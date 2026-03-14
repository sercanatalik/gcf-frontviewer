import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { WEIGHTED_FIELDS, F, IDENTIFIER_RE } from "@/lib/field-defs"
import { resolveParam, resolveOptionalParam, whereString, cacheJson, errorJson, extractAsofDate } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fieldName = resolveParam(searchParams, "fieldName", F.cashOut)
  const groupBy = resolveOptionalParam(searchParams, "groupBy")
  const filtersJson = searchParams.get("filters") || ""

  if (!IDENTIFIER_RE.test(fieldName)) {
    return NextResponse.json({ error: "Invalid field name" }, { status: 400 })
  }
  if (groupBy && !IDENTIFIER_RE.test(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy field" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()
    const { cleaned, asOfDate } = extractAsofDate(filtersJson)

    const { clauses, params } = cleaned
      ? buildWhereClausesFromFilters(cleaned)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    if (asOfDate) {
      clauses.push(`${F.asOfDate} <= {_asof:String}`)
      params["_asof"] = asOfDate
    } else {
      clauses.push(`${F.asOfDate} <= (SELECT max(${F.asOfDate}) FROM gcf_risk_mv FINAL)`)
    }

    const groupByExpr = groupBy ? `, ${groupBy}` : ""
    const weighted = WEIGHTED_FIELDS[fieldName]
    const selectExpr = weighted
      ? `sum(toFloat64OrZero(toString(${weighted.numerator})) * toFloat64OrZero(toString(${weighted.weight}))) / nullIf(sum(toFloat64OrZero(toString(${weighted.weight}))), 0) AS ${fieldName}`
      : `sum(toFloat64OrZero(toString(${fieldName}))) AS ${fieldName}`

    const query = `
      SELECT
        ${F.asOfDate}${groupByExpr},
        ${selectExpr}
      FROM gcf_risk_mv FINAL
      ${whereString(clauses)}
      GROUP BY ${F.asOfDate}${groupByExpr}
      ORDER BY ${F.asOfDate}${groupByExpr}
    `

    const result = await client.query({ query, query_params: params, format: "JSONEachRow" })
    const rows = await result.json()

    return cacheJson({
      data: rows,
      meta: { fieldName, groupBy: groupBy || null, recordCount: (rows as unknown[]).length },
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Table") && error.message.includes("doesn't exist")) {
        return NextResponse.json({ error: "Table not found" }, { status: 404 })
      }
      if (error.message.includes("column") || error.message.includes("Missing columns")) {
        return NextResponse.json({ error: "Invalid field or column" }, { status: 400 })
      }
    }
    return errorJson("Historical data error", error)
  }
}
