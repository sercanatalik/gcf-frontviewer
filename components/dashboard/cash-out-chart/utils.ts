export const FIELD_OPTIONS = [
  { value: "cashOut", label: "Cash Out" },
  { value: "fundingAmount", label: "Funding Amount" },
  { value: "collateralAmount", label: "Collateral Amount" },
]

export const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(221, 83%, 53%)",
  "hsl(224, 76%, 48%)",
  "hsl(226, 71%, 40%)",
  "hsl(217, 60%, 68%)",
]

import { sanitizeKey } from "@/lib/utils"
export { sanitizeKey }

export function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
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

  // Group by week, taking the last snapshot (latest asofDate) in each week
  if (!groupByField) {
    const byWeek: Record<string, { value: number; lastDate: string }> = {}
    for (const item of data) {
      const d = String(item.asofDate)
      const w = toWeek(d)
      const existing = byWeek[w]
      if (!existing || d > existing.lastDate) {
        byWeek[w] = { value: Number(item[fieldName] || 0), lastDate: d }
      }
    }
    return Object.entries(byWeek)
      .map(([, { value, lastDate }]) => ({
        date: fmtDay(lastDate),
        fullDate: lastDate,
        Total: value,
      }))
      .sort(byDate)
  }

  // Grouped: collect all rows per date, then pick the last date per week
  const byDate_: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const item of data) {
    const d = String(item.asofDate)
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const v = Number(item[fieldName] || 0)
    if (isNaN(v)) continue
    const bucket = (byDate_[d] ??= {})
    bucket[g] = (bucket[g] || 0) + v
    totals[g] = (totals[g] || 0) + Math.abs(v)
  }

  // Pick last date per week
  const weekLastDate: Record<string, string> = {}
  for (const d of Object.keys(byDate_).sort()) {
    const w = toWeek(d)
    weekLastDate[w] = d
  }

  const top5 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)

  return Object.values(weekLastDate)
    .map((d) => {
      const groups = byDate_[d]!
      const point: Record<string, unknown> = { date: fmtDay(d), fullDate: d }
      let others = 0
      for (const [k, v] of Object.entries(groups)) {
        if (top5.includes(k)) point[k] = v
        else others += v
      }
      if (others !== 0) point["Others"] = others
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

  // SQL already returns cumulative decreasing values — just format for the chart
  if (!groupByField) {
    return data
      .map((item) => ({
        date: fmtDay(String(item.maturityDt)),
        fullDate: String(item.maturityDt),
        Total: Number(item[fieldName] || 0),
      }))
      .sort(byDate)
  }

  // Grouped: pivot rows into { date, group1: val, group2: val, ... }
  const byMonthMap: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const item of data) {
    const m = String(item.maturityDt)
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const v = Number(item[fieldName] || 0)
    if (isNaN(v)) continue
    const bucket = (byMonthMap[m] ??= {})
    bucket[g] = (bucket[g] || 0) + v
    totals[g] = (totals[g] || 0) + Math.abs(v)
  }

  const top5 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)

  return Object.entries(byMonthMap)
    .map(([m, groups]) => {
      const point: Record<string, unknown> = { date: fmtDay(m), fullDate: m }
      let others = 0
      for (const [k, v] of Object.entries(groups)) {
        if (top5.includes(k)) point[k] = v
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

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function fmtDay(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function toWeek(d: string): string {
  const date = new Date(d)
  const day = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((day + 6) % 7))
  return monday.toISOString().slice(0, 10)
}

function toMonth(d: string): string {
  return new Date(d).toISOString().slice(0, 7)
}

function byDate(a: { fullDate: string }, b: { fullDate: string }): number {
  return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
}
