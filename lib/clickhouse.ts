import { createClient } from "@clickhouse/client"

const host = process.env.CLICKHOUSE_HOST || "localhost"
const port = process.env.CLICKHOUSE_PORT || "8123"
const database = process.env.CLICKHOUSE_DATABASE || "default"
const username = process.env.CLICKHOUSE_USERNAME || "default"
const password = process.env.CLICKHOUSE_PASSWORD || ""

let client: ReturnType<typeof createClient>

export function getClickHouseClient() {
  if (!client) {
    client = createClient({
      url: `http://${host}:${port}`,
      database,
      username,
      password,
      compression: { response: true, request: true },
      max_open_connections: 10,
      request_timeout: 30_000,
    })
  }
  return client
}

export const allowedTables: string[] = (
  process.env.CLICKHOUSE_TABLES || "gcf_risk_mv,gcf_hmsbooks,gcf_counterpart,gcf_trade"
)
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean)

export function isTableAllowed(name: string): boolean {
  return allowedTables.length === 0 || allowedTables.includes(name)
}
