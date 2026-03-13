import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { WEIGHTED_FIELDS, F, IDENTIFIER_RE } from "@/lib/field-defs"
import { resolveParam, resolveOptionalParam, cacheJson, errorJson, extractAsofDate } from "@/lib/api-utils"

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
    const { cleaned, asofDate } = extractAsofDate(filtersJson)

    const { clauses, params } = cleaned
      ? buildWhereClausesFromFilters(cleaned)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    if (asofDate) {
      clauses.push(`gcf_risk_mv.${F.asofDate} = {_asof:String}`)
      params["_asof"] = asofDate
    } else {
      clauses.push(`gcf_risk_mv.${F.asofDate} = (SELECT max(${F.asofDate}) FROM gcf_risk_mv FINAL)`)
    }

    const maturityCutoff = asofDate
      ? `${F.maturityDt} >= {_asof:String}`
      : `${F.maturityDt} >= today()`

    const filterWhere = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""
    const groupByExpr = groupBy ? `, ${groupBy}` : ""
    const partitionExpr = groupBy ? `PARTITION BY ${groupBy} ` : ""
    const joinExpr = groupBy ? `JOIN total_per_group t ON m.${groupBy} = t.${groupBy}` : "CROSS JOIN total_amounts t"
    const totalGroupBy = groupBy
      ? `total_per_group AS (
          SELECT ${groupBy}, SUM(monthly_amount) AS total
          FROM monthly_data
          GROUP BY ${groupBy}
        )`
      : `total_amounts AS (
          SELECT SUM(monthly_amount) AS total
          FROM monthly_data
        )`

    const weighted = WEIGHTED_FIELDS[fieldName]
    const monthlyAggExpr = weighted
      ? `sum(toFloat64OrZero(toString(${weighted.numerator})) * toFloat64OrZero(toString(${weighted.weight}))) / nullIf(sum(toFloat64OrZero(toString(${weighted.weight}))), 0) AS monthly_amount`
      : `sum(toFloat64OrZero(toString(${fieldName}))) AS monthly_amount`

    const query = `
      WITH monthly_data AS (
        SELECT
          toStartOfWeek(${F.maturityDt}) AS month
          ${groupByExpr},
          ${monthlyAggExpr}
        FROM gcf_risk_mv FINAL
        ${filterWhere}
          AND ${maturityCutoff}
        GROUP BY month${groupByExpr}
      ),
      ${totalGroupBy},
      cumulative_data AS (
        SELECT
          m.month
          ${groupByExpr ? `, m.${groupBy}` : ""},
          m.monthly_amount,
          t.total - SUM(m.monthly_amount) OVER (${partitionExpr}ORDER BY m.month ROWS UNBOUNDED PRECEDING) AS remaining
        FROM monthly_data m
        ${joinExpr}
      )
      SELECT
        month AS ${F.maturityDt}
        ${groupByExpr},
        remaining AS ${fieldName}
      FROM cumulative_data
      ORDER BY month${groupByExpr}
    `

    const result = await client.query({ query, query_params: params, format: "JSONEachRow" })
    const rows = await result.json()

    return cacheJson({
      data: rows,
      meta: { fieldName, groupBy: groupBy || null, recordCount: (rows as unknown[]).length },
    })
  } catch (error) {
    return errorJson("Future data error", error)
  }
}
