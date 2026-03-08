import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"

const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fieldName = searchParams.get("fieldName") || "cashOut"
  const groupBy = searchParams.get("groupBy") || undefined
  const filtersJson = searchParams.get("filters") || ""

  if (!IDENTIFIER_RE.test(fieldName)) {
    return NextResponse.json({ error: "Invalid field name" }, { status: 400 })
  }
  if (groupBy && !IDENTIFIER_RE.test(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy field" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()

    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    // Scope to latest asofDate if not filtered
    if (!hasAsofDate) {
      clauses.push("gcf_risk_mv.asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    }

    const filterWhere = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""

    const groupByExpr = groupBy ? `, ${groupBy}` : ""

    const partitionExpr = groupBy ? `PARTITION BY ${groupBy} ` : ""

    const query = `
      SELECT
        maturityDt
        ${groupByExpr},
        sum(${fieldName}_monthly) OVER (${partitionExpr}ORDER BY maturityDt) AS ${fieldName}
      FROM (
        SELECT
          toStartOfMonth(maturityDt) AS maturityDt
          ${groupByExpr},
          sum(toFloat64OrZero(toString(${fieldName}))) AS ${fieldName}_monthly
        FROM gcf_risk_mv
        ${filterWhere}
          AND maturityDt >= today()
        GROUP BY maturityDt${groupByExpr}
      )
      ORDER BY maturityDt${groupByExpr}
    `

    const result = await client.query({
      query,
      query_params: params,
      format: "JSONEachRow",
    })
    const rows = await result.json()

    return NextResponse.json(
      {
        data: rows,
        meta: {
          fieldName,
          groupBy: groupBy || null,
          recordCount: (rows as unknown[]).length,
        },
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    )
  } catch (error) {
    console.error("Future data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
