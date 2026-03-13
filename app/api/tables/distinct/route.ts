import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient, isTableAllowed } from "@/lib/clickhouse"
import { DATE_COLUMNS } from "@/lib/columns"
import { ALLOWED_FILTER_COLUMNS } from "@/lib/field-defs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get("table")
  const column = searchParams.get("column")

  if (!table || !column) {
    return NextResponse.json(
      { error: "Missing required parameters: table and column" },
      { status: 400 },
    )
  }

  if (!isTableAllowed(table)) {
    return NextResponse.json(
      { error: `Table "${table}" is not allowed` },
      { status: 400 },
    )
  }

  if (!ALLOWED_FILTER_COLUMNS.has(column)) {
    return NextResponse.json(
      { error: `Column "${column}" is not a valid filter column` },
      { status: 400 },
    )
  }

  try {
    const isDateColumn = DATE_COLUMNS.has(column)
    const expr = isDateColumn
      ? `formatDateTime(${column}, '%Y-%m-%d')`
      : `toString(${column})`

    const query = `
      SELECT DISTINCT ${expr} AS value
      FROM ${table} FINAL
      WHERE ${column} IS NOT NULL${isDateColumn ? "" : ` AND toString(${column}) != ''`}
      ORDER BY value
      LIMIT 1000
    `

    const client = getClickHouseClient()
    const result = await client.query({ query, format: "JSONEachRow" })
    const rows = await result.json<{ value: string }>()
    const values = rows.map((r) => r.value)

    return NextResponse.json(values, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    })
  } catch (error) {
    console.error("Error fetching distinct values:", error)

    const message = error instanceof Error ? error.message : ""
    if (message.includes("doesn't exist")) {
      return NextResponse.json({ error: "Table or column not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
