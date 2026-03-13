export { CHART_FIELD_OPTIONS as FIELD_OPTIONS } from "@/lib/field-defs"
export { CHART_COLORS } from "@/lib/chart-colors"

import { sanitizeKey } from "@/lib/utils"
export { sanitizeKey }

import { formatBpsRaw, formatCurrencyCompact } from "@/lib/format"

export { formatBpsRaw as formatBps, formatCurrencyCompact as formatCurrency }

export function getTickFormatter(fieldName: string): (value: number) => string {
  if (fieldName === "weightedSpread") return formatBpsRaw
  return formatCurrencyCompact
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

  // Group by bi-weekly period, computing average across daily snapshots
  if (!groupByField) {
    const byPeriod: Record<string, { sum: number; count: number; lastDate: string }> = {}
    for (const item of data) {
      const d = String(item.asofDate)
      const m = toBiWeek(d)
      const v = Number(item[fieldName] || 0)
      const existing = byPeriod[m]
      if (existing) {
        existing.sum += v
        existing.count += 1
        if (d > existing.lastDate) existing.lastDate = d
      } else {
        byPeriod[m] = { sum: v, count: 1, lastDate: d }
      }
    }
    return Object.entries(byPeriod)
      .map(([, { sum, count, lastDate }]) => ({
        date: fmtDate(lastDate),
        fullDate: lastDate,
        Total: sum / count,
      }))
      .sort(byDate)
  }

  // Grouped: collect all rows per date, then average by bi-weekly period
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

  // Average per bi-weekly period: sum each group's daily values, divide by day count
  const periodGroups: Record<string, { sums: Record<string, number>; count: number; lastDate: string }> = {}
  for (const d of Object.keys(byDate_).sort()) {
    const m = toBiWeek(d)
    const entry = (periodGroups[m] ??= { sums: {}, count: 0, lastDate: d })
    entry.count += 1
    if (d > entry.lastDate) entry.lastDate = d
    for (const [g, v] of Object.entries(byDate_[d]!)) {
      entry.sums[g] = (entry.sums[g] || 0) + v
    }
  }

  const top5 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)

  return Object.values(periodGroups)
    .map(({ sums, count, lastDate }) => {
      const point: Record<string, unknown> = { date: fmtDate(lastDate), fullDate: lastDate }
      let others = 0
      for (const [k, v] of Object.entries(sums)) {
        const avg = v / count
        if (top5.includes(k)) point[k] = avg
        else others += avg
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
  const byPeriodMap: Record<string, Record<string, number>> = {}
  const totals: Record<string, number> = {}

  for (const item of data) {
    const m = String(item.maturityDt)
    const g = sanitizeKey(String(item[groupByField] || "Unknown"))
    const v = Number(item[fieldName] || 0)
    if (isNaN(v)) continue
    const bucket = (byPeriodMap[m] ??= {})
    bucket[g] = (bucket[g] || 0) + v
    totals[g] = (totals[g] || 0) + Math.abs(v)
  }

  const top5 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)

  return Object.entries(byPeriodMap)
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
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function fmtDay(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** Bucket a date string into a bi-weekly (2-week) period key. */
function toBiWeek(d: string): string {
  const date = new Date(d)
  const year = date.getFullYear()
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000)
  const biWeek = Math.floor(dayOfYear / 14)
  return `${year}-bw${String(biWeek).padStart(2, "0")}`
}

function byDate(a: { fullDate: string }, b: { fullDate: string }): number {
  return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
}
