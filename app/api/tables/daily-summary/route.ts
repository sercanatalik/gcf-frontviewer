import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { F, DAILY_SUMMARY_FIELDS } from "@/lib/field-defs"

const MAX_LIMIT = 1000000
const DEFAULT_LIMIT = 100000

export async function GET(request: NextRequest) {
  try {
    const client = getClickHouseClient()
    const searchParams = request.nextUrl.searchParams

    const limit = Math.min(
      Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
      MAX_LIMIT,
    )
    const offset = Number(searchParams.get("offset") ?? 0)
    const asOfDate = searchParams.get("asOfDate")

    const whereClauses: string[] = []
    const queryParams: Record<string, unknown> = {}

    const filtersParam = searchParams.get("filters")
    if (filtersParam) {
      const { clauses, params } = buildWhereClausesFromFilters(filtersParam)
      whereClauses.push(...clauses)
      Object.assign(queryParams, params)
    }

    if (asOfDate && asOfDate !== "__latest__") {
      whereClauses.push(`${F.asOfDate} <= {_asof:String}`)
      queryParams["_asof"] = asOfDate
    }

    const whereStr =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""

    const summarySelect = DAILY_SUMMARY_FIELDS
      .map((col) => `sum(toFloat64OrZero(toString(${col}))) AS ${col}`)
      .join(",\n        ")

    const query = `
      SELECT
        ${F.asOfDate},
        ${summarySelect}
      FROM gcf_risk_mv FINAL
      ${whereStr}
      GROUP BY ${F.asOfDate}
      ORDER BY ${F.asOfDate}
      LIMIT ${limit} OFFSET ${offset}
    `

    const countQuery = `
      SELECT count() AS count FROM (
        SELECT ${F.asOfDate}
        FROM gcf_risk_mv FINAL
        ${whereStr}
        GROUP BY ${F.asOfDate}
      )
    `

    const [dataResult, countResult] = await Promise.all([
      client.query({
        query,
        query_params: queryParams,
        format: "JSONEachRow",
      }),
      client.query({
        query: countQuery,
        query_params: queryParams,
        format: "JSONEachRow",
      }),
    ])

    const rows = await dataResult.json()
    const countRows = await countResult.json<{ count: string }>()
    const totalRows = Number(countRows[0]?.count ?? 0)

    return NextResponse.json(
      {
        table: "gcf_daily_summary",
        rows,
        meta: {
          totalRows,
          limit,
          offset,
          hasMore: offset + limit < totalRows,
        },
      },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } },
    )
  } catch (error) {
    console.error("Daily summary error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
