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
    const { cleaned, asOfDate } = extractAsofDate(filtersJson)

    const { clauses, params } = cleaned
      ? buildWhereClausesFromFilters(cleaned)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    // Scope to a single snapshot date
    if (asOfDate) {
      clauses.push(`gcf_risk_mv.${F.asOfDate} = {_asof:String}`)
      params["_asof"] = asOfDate
    } else {
      clauses.push(`gcf_risk_mv.${F.asOfDate} = (SELECT max(${F.asOfDate}) FROM gcf_risk_mv FINAL)`)
    }

    // Only future maturities
    const maturityCutoff = asOfDate
      ? `${F.maturityDt} >= {_asof:String}`
      : `${F.maturityDt} >= today()`

    const filterWhere = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""
    const groupByExpr = groupBy ? `, ${groupBy}` : ""
    const partitionExpr = groupBy ? `PARTITION BY ${groupBy} ` : ""

    const weighted = WEIGHTED_FIELDS[fieldName]
    const aggExpr = weighted
      ? `sum(toFloat64OrZero(toString(${weighted.numerator})) * toFloat64OrZero(toString(${weighted.weight}))) / nullIf(sum(toFloat64OrZero(toString(${weighted.weight}))), 0)`
      : `sum(toFloat64OrZero(toString(${fieldName})))`

    // For each maturity week: compute total live exposure = total - cumulative matured
    // This gives a declining profile showing remaining exposure over time
    const query = `
      WITH
        weekly AS (
          SELECT
            toStartOfWeek(${F.maturityDt}) AS week
            ${groupByExpr},
            ${aggExpr} AS maturing
          FROM gcf_risk_mv FINAL
          ${filterWhere}
            AND ${maturityCutoff}
          GROUP BY week${groupByExpr}
        ),
        total AS (
          SELECT
            ${groupBy ? `${groupBy},` : ""}
            ${aggExpr} AS grand_total
          FROM gcf_risk_mv FINAL
          ${filterWhere}
            AND ${maturityCutoff}
          ${groupBy ? `GROUP BY ${groupBy}` : ""}
        )
      SELECT
        w.week AS ${F.maturityDt}
        ${groupByExpr ? `, w.${groupBy}` : ""},
        greatest(
          t.grand_total - SUM(w.maturing) OVER (${partitionExpr}ORDER BY w.week ROWS UNBOUNDED PRECEDING),
          0
        ) AS ${fieldName}
      FROM weekly w
      ${groupBy ? `JOIN total t ON w.${groupBy} = t.${groupBy}` : "CROSS JOIN total t"}
      ORDER BY w.week${groupByExpr}
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
