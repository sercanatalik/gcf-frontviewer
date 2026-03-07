import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"

const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/

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

  if (!IDENTIFIER_RE.test(table) || !IDENTIFIER_RE.test(column)) {
    return NextResponse.json(
      { error: "Invalid identifier. Only alphanumeric characters and underscores are allowed." },
      { status: 400 },
    )
  }

  try {
    const isDateColumn = column.toLowerCase().includes("date")
    const expr = isDateColumn
      ? `formatDateTime(${column}, '%Y-%m-%d')`
      : `toString(${column})`

    const query = `
      SELECT DISTINCT ${expr} AS value
      FROM ${table}
      WHERE ${column} IS NOT NULL AND ${expr} != ''
      ORDER BY value
      LIMIT 1000
    `

    const client = getClickHouseClient()
    const result = await client.query({ query, format: "JSONEachRow" })
    const rows = await result.json<{ value: string }>()
    const values = rows.map((r) => r.value)

    return NextResponse.json(values)
  } catch (error) {
    console.error("Error fetching distinct values:", error)

    const message = error instanceof Error ? error.message : ""
    if (message.includes("doesn't exist")) {
      return NextResponse.json({ error: "Table or column not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
