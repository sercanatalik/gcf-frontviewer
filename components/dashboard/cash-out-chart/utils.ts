export const FIELD_OPTIONS = [
  { value: "cashOut", label: "Cash Out" },
  { value: "fundingAmount", label: "Funding Amount" },
  { value: "collateralAmount", label: "Collateral Amount" },
]

export const MONOCHROME_COLORS = [
  "#0a0e15",
  "#2a3441",
  "#525c6a",
  "#7f8b9b",
  "#b8c1ce",
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
    // Aggregate daily data into monthly buckets
    const byMonth: Record<string, number> = {}
    for (const item of data) {
      const m = toMonth(String(item.asofDate))
      byMonth[m] = (byMonth[m] || 0) + Number(item[fieldName] || 0)
    }
    return Object.entries(byMonth)
      .map(([m, v]) => ({ date: fmtDate(m + "-01"), fullDate: m + "-01", Total: v }))
      .sort(byDate)
  }

  // Grouped: aggregate by month + group
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
): { date: string; fullDate: string; [k: string]: unknown }[] {
  if (!data || data.length === 0) return []

  const first = data[0]!
  const cumulativeField = Object.keys(first).find((k) =>
    k.startsWith("cumulative_"),
  )
  if (!cumulativeField) return []
  const fieldName = cumulativeField.replace("cumulative_", "")
  const groupByField = Object.keys(first).find(
    (k) => k !== "maturityDt" && k !== fieldName && k !== cumulativeField,
  )

  if (!groupByField) {
    const byMonth: Record<string, number> = {}
    for (const item of data) {
      const d = toMonth(String(item.maturityDt))
      byMonth[d] = Number(item[cumulativeField] || 0)
    }
    return Object.entries(byMonth)
      .map(([d, v]) => ({ date: fmtDate(d + "-01"), fullDate: d + "-01", Total: v }))
      .sort(byDate)
  }

  const totals: Record<string, number> = {}
  const latestByGroupMonth: Record<string, Record<string, number>> = {}

  for (const item of data) {
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const cv = Number(item[cumulativeField] || 0)
    if (!totals[g] || cv > totals[g]) totals[g] = cv
    const d = toMonth(String(item.maturityDt))
    latestByGroupMonth[g] ??= {}
    latestByGroupMonth[g][d] = cv
  }

  const allMonths = new Set<string>()
  for (const m of Object.values(latestByGroupMonth)) {
    for (const month of Object.keys(m)) allMonths.add(month)
  }

  const top4 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k)

  const grouped: Record<string, Record<string, number>> = {}
  for (const d of allMonths) {
    grouped[d] = {}
    for (const [g, months] of Object.entries(latestByGroupMonth)) {
      let v = months[d]
      if (v === undefined) {
        const sorted = Object.keys(months).sort()
        const prev = sorted.filter((m) => m <= d)
        v = prev.length > 0 ? months[prev[prev.length - 1]!] : totals[g] || 0
      }
      grouped[d][g] = v || 0
    }
  }

  return Object.entries(grouped)
    .map(([d, groups]) => {
      const point: Record<string, unknown> = {
        date: fmtDate(d + "-01"),
        fullDate: d + "-01",
      }
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

export function getChartGroups(
  chartData: { date: string; fullDate: string; [k: string]: unknown }[],
): string[] {
  if (chartData.length === 0) return []
  return Object.keys(chartData[0]!).filter((k) => k !== "date" && k !== "fullDate")
}

export function getBarColor(group: string, index: number, isStacked: boolean): string {
  if (!isStacked) return "var(--foreground)"
  if (group === "Others") return MONOCHROME_COLORS[MONOCHROME_COLORS.length - 1]!
  return MONOCHROME_COLORS[Math.min(index, MONOCHROME_COLORS.length - 2)]!
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
