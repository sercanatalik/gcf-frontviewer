import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { WEIGHTED_FIELDS } from "@/lib/field-defs"

const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

/**
 * Strip asofDate entries from serialised filters and return the date value.
 * The historical route treats asofDate as an upper bound (<=), not exact match.
 */
function extractAsofDate(filtersJson: string): { cleaned: string; asofDate: string | null } {
  if (!filtersJson) return { cleaned: "", asofDate: null }
  try {
    const parsed = JSON.parse(filtersJson) as Array<{ field: string; operator: string; value: string[] }>
    const asofEntry = parsed.find((f) => f.field === "asofDate")
    const asofDate = asofEntry?.value?.[0] ?? null
    const rest = parsed.filter((f) => f.field !== "asofDate")
    return { cleaned: rest.length > 0 ? JSON.stringify(rest) : "", asofDate }
  } catch {
    return { cleaned: filtersJson, asofDate: null }
  }
}

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

    // Extract asofDate separately — historical chart uses it as upper bound, not equality
    const { cleaned, asofDate } = extractAsofDate(filtersJson)

    const { clauses, params } = cleaned
      ? buildWhereClausesFromFilters(cleaned)
      : { clauses: [] as string[], params: {} as Record<string, unknown> }

    if (asofDate) {
      clauses.push("asofDate <= {_asof:String}")
      params["_asof"] = asofDate
    } else {
      clauses.push("asofDate <= (SELECT max(asofDate) FROM gcf_risk_mv)")
    }

    const whereStr = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""

    const groupByExpr = groupBy ? `, ${groupBy}` : ""

    const weighted = WEIGHTED_FIELDS[fieldName]
    const selectExpr = weighted
      ? `sum(toFloat64OrZero(toString(${weighted.numerator})) * toFloat64OrZero(toString(${weighted.weight}))) / nullIf(sum(toFloat64OrZero(toString(${weighted.weight}))), 0) AS ${fieldName}`
      : `sum(toFloat64OrZero(toString(${fieldName}))) AS ${fieldName}`

    const query = `
      SELECT
        asofDate${groupByExpr},
        ${selectExpr}
      FROM gcf_risk_mv
      ${whereStr}
      GROUP BY asofDate${groupByExpr}
      ORDER BY asofDate${groupByExpr}
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
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
    )
  } catch (error) {
    console.error("Historical data error:", error)

    if (error instanceof Error) {
      if (error.message.includes("Table") && error.message.includes("doesn't exist")) {
        return NextResponse.json({ error: "Table not found" }, { status: 404 })
      }
      if (error.message.includes("column") || error.message.includes("Missing columns")) {
        return NextResponse.json({ error: "Invalid field or column" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
