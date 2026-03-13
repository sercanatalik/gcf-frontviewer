export const TREND_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(221, 83%, 53%)",
  "hsl(224, 76%, 48%)",
  "hsl(226, 71%, 40%)",
  "hsl(217, 60%, 68%)",
  "hsl(210, 70%, 55%)",
  "hsl(230, 65%, 58%)",
  "hsl(215, 50%, 62%)",
]

export function formatValue(value: number, formatter: string): string {
  switch (formatter) {
    case "currency": {
      const sign = value < 0 ? "-" : ""
      const abs = Math.abs(value)
      if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
      if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
      if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
      return `${sign}$${abs.toFixed(0)}`
    }
    case "bps":
      return `${value.toFixed(2)}bp`
    case "percent":
      return `${value.toFixed(1)}%`
    case "days":
      return `${value.toFixed(0)}d`
    case "count":
      return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
    default:
      return value.toLocaleString()
  }
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  if (!y || !m || !d) return dateStr
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

import { sanitizeKey } from "@/lib/utils"
export { sanitizeKey }

/**
 * Transform raw ungrouped time-series rows into chart data.
 */
export function processSimpleData(
  rows: Record<string, unknown>[],
): { date: string; fullDate: string; value: number }[] {
  return rows.map((row) => ({
    date: formatDateLabel(String(row.dt)),
    fullDate: String(row.dt),
    value: Number(row.value) || 0,
  }))
}

/**
 * Transform grouped time-series rows into pivoted chart data.
 * Each row becomes { date, fullDate, [group1]: val, [group2]: val, ... }
 */
export function processGroupedData(
  rows: Record<string, unknown>[],
  groups: string[],
): { date: string; fullDate: string; [k: string]: unknown }[] {
  const byDate = new Map<string, Record<string, unknown>>()

  for (const row of rows) {
    const d = String(row.dt)
    const grp = sanitizeKey(String(row.grp || "Unknown"))
    const val = Number(row.value) || 0

    if (!byDate.has(d)) {
      byDate.set(d, { date: formatDateLabel(d), fullDate: d })
    }
    const point = byDate.get(d)!
    point[grp] = val
  }

  // Ensure all groups exist in each point
  const sanitizedGroups = groups.map(sanitizeKey)
  for (const point of byDate.values()) {
    for (const g of sanitizedGroups) {
      if (!(g in point)) point[g] = 0
    }
  }

  return ([...byDate.values()] as { date: string; fullDate: string; [k: string]: unknown }[]).sort(
    (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime(),
  )
}
