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

    let query: string

    if (groupBy) {
      query = `
        WITH monthly_data AS (
          SELECT
            toStartOfMonth(maturityDt) AS month,
            ${groupBy},
            sum(toFloat64OrZero(toString(${fieldName}))) AS monthly_amount
          FROM gcf_risk_mv
          ${filterWhere}
            AND maturityDt >= today()
          GROUP BY month, ${groupBy}
        ),
        total_per_group AS (
          SELECT ${groupBy}, sum(monthly_amount) AS total
          FROM monthly_data
          GROUP BY ${groupBy}
        ),
        cumulative_data AS (
          SELECT
            m.month,
            m.${groupBy},
            m.monthly_amount,
            t.total - sum(m.monthly_amount) OVER (
              PARTITION BY m.${groupBy} ORDER BY m.month ROWS UNBOUNDED PRECEDING
            ) AS remaining
          FROM monthly_data m
          JOIN total_per_group t ON m.${groupBy} = t.${groupBy}
        )
        SELECT
          month AS maturityDt,
          ${groupBy},
          monthly_amount AS ${fieldName},
          remaining AS cumulative_${fieldName}
        FROM cumulative_data
        ORDER BY month, ${groupBy}
      `
    } else {
      query = `
        WITH monthly_data AS (
          SELECT
            toStartOfMonth(maturityDt) AS month,
            sum(toFloat64OrZero(toString(${fieldName}))) AS monthly_amount
          FROM gcf_risk_mv
          ${filterWhere}
            AND maturityDt >= today()
          GROUP BY month
        ),
        total_amounts AS (
          SELECT sum(monthly_amount) AS total FROM monthly_data
        ),
        cumulative_data AS (
          SELECT
            m.month,
            m.monthly_amount,
            t.total - sum(m.monthly_amount) OVER (
              ORDER BY m.month ROWS UNBOUNDED PRECEDING
            ) AS remaining
          FROM monthly_data m
          CROSS JOIN total_amounts t
        )
        SELECT
          month AS maturityDt,
          monthly_amount AS ${fieldName},
          remaining AS cumulative_${fieldName}
        FROM cumulative_data
        ORDER BY month
      `
    }

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
