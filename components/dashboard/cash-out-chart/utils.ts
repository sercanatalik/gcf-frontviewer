export const FIELD_OPTIONS = [
  { value: "cashOut", label: "Cash Out" },
  { value: "fundingAmount", label: "Funding Amount" },
  { value: "collateralAmount", label: "Collateral Amount" },
]

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function sanitizeKey(key: string): string {
  return String(key).replace(/[^a-zA-Z0-9]/g, "_")
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function processHistoricalData(
  data: Record<string, unknown>[],
  fieldName: string,
): { date: string; fullDate: string; [k: string]: unknown }[] {
  if (!data || data.length === 0) return []

  const first = data[0]!
  const groupByField = Object.keys(first).find(
    (k) => k !== "asofDate" && k !== fieldName,
  )

  if (!groupByField) {
    const byMonth: Record<string, number> = {}
    for (const item of data) {
      const m = toMonth(String(item.asofDate))
      byMonth[m] = (byMonth[m] || 0) + Number(item[fieldName] || 0)
    }
    return Object.entries(byMonth)
      .map(([m, v]) => ({ date: fmtDate(m + "-01"), fullDate: m + "-01", Total: v }))
      .sort(byDate)
  }

  const byMonthMap: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const item of data) {
    const m = toMonth(String(item.asofDate))
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const v = Number(item[fieldName] || 0)
    if (isNaN(v)) continue
    const bucket = (byMonthMap[m] ??= {})
    bucket[g] = (bucket[g] || 0) + v
    totals[g] = (totals[g] || 0) + v
  }

  const top4 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k)

  return Object.entries(byMonthMap)
    .map(([m, groups]) => {
      const point: Record<string, unknown> = { date: fmtDate(m + "-01"), fullDate: m + "-01" }
      let others = 0
      for (const [k, v] of Object.entries(groups)) {
        if (top4.includes(k)) point[k] = v
        else others += v
      }
      if (others > 0) point["Others"] = others
      return point as { date: string; fullDate: string }
    })
    .sort(byDate)
}

export function processFutureData(
  data: Record<string, unknown>[],
  fieldName: string,
): { date: string; fullDate: string; [k: string]: unknown }[] {
  if (!data || data.length === 0) return []

  const first = data[0]!
  const groupByField = Object.keys(first).find(
    (k) => k !== "maturityDt" && k !== fieldName,
  )

  if (!groupByField) {
    const byMonth: Record<string, number> = {}
    for (const item of data) {
      const m = toMonth(String(item.maturityDt))
      byMonth[m] = (byMonth[m] || 0) + Number(item[fieldName] || 0)
    }
    return Object.entries(byMonth)
      .map(([m, v]) => ({ date: fmtDate(m + "-01"), fullDate: m + "-01", Total: v }))
      .sort(byDate)
  }

  const byMonthMap: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const item of data) {
    const m = toMonth(String(item.maturityDt))
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const v = Number(item[fieldName] || 0)
    if (isNaN(v)) continue
    const bucket = (byMonthMap[m] ??= {})
    bucket[g] = (bucket[g] || 0) + v
    totals[g] = (totals[g] || 0) + v
  }

  const top4 = Object.entries(totals)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 4)
    .map(([k]) => k)

  return Object.entries(byMonthMap)
    .map(([m, groups]) => {
      const point: Record<string, unknown> = { date: fmtDate(m + "-01"), fullDate: m + "-01" }
      let others = 0
      for (const [k, v] of Object.entries(groups)) {
        if (top4.includes(k)) point[k] = v
        else others += v
      }
      if (others !== 0) point["Others"] = others
      return point as { date: string; fullDate: string }
    })
    .sort(byDate)
}

export function getChartGroups(
  chartData: { date: string; fullDate: string; [k: string]: unknown }[],
): string[] {
  if (chartData.length === 0) return []
  const keys = new Set<string>()
  for (const point of chartData) {
    for (const k of Object.keys(point)) {
      if (k !== "date" && k !== "fullDate") keys.add(k)
    }
  }
  return Array.from(keys)
}

export function getGroupColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function toMonth(d: string): string {
  return new Date(d).toISOString().slice(0, 7)
}

function byDate(a: { fullDate: string }, b: { fullDate: string }): number {
  return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
}
