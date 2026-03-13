import { NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { allowedTables } from "@/lib/clickhouse"
import { clickhouseToPerspective } from "@/lib/clickhouse-type-map"
import { F } from "@/lib/field-defs"

export async function GET() {
  try {
    const clickhouse = getClickHouseClient()

    let tableNames: string[]
    if (allowedTables.length > 0) {
      tableNames = allowedTables
    } else {
      const tablesResult = await clickhouse.query({
        query: "SHOW TABLES",
        format: "TabSeparated",
      })
      const tablesText = await tablesResult.text()
      tableNames = tablesText.trim().split("\n").filter(Boolean)
    }

    const tables = await Promise.all(
      tableNames.map(async (name) => {
        const [schemaResult, countResult] = await Promise.all([
          clickhouse.query({
            query: `DESCRIBE TABLE ${name}`,
            format: "JSONEachRow",
          }),
          clickhouse.query({
            query: `SELECT count() as count FROM ${name}`,
            format: "JSONEachRow",
          }),
        ])

        const columns = await schemaResult.json<{
          name: string
          type: string
          default_type: string
          default_expression: string
          comment: string
        }>()

        const countRows = await countResult.json<{ count: string }>()
        const rowCount = Number(countRows[0]?.count ?? 0)

        const hasAsOfDate = columns.some((col) => col.name === F.asofDate)

        let latestAsOfDate: string | undefined
        if (hasAsOfDate) {
          const maxResult = await clickhouse.query({
            query: `SELECT max(${F.asofDate}) as max_date FROM ${name}`,
            format: "JSONEachRow",
          })
          const maxRows = await maxResult.json<{ max_date: string }>()
          latestAsOfDate = maxRows[0]?.max_date || undefined
        }

        return {
          name,
          columns: columns.map((col) => ({
            name: col.name,
            type: col.type,
            perspectiveType: clickhouseToPerspective(col.type),
            defaultType: col.default_type || undefined,
            defaultExpression: col.default_expression || undefined,
            comment: col.comment || undefined,
          })),
          rowCount,
          hasAsOfDate,
          latestAsOfDate,
        }
      })
    )

    return NextResponse.json({ tables })
  } catch (error) {
    console.error("Failed to fetch tables:", error)
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    )
  }
}
