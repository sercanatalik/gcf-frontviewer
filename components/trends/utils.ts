import { CHART_COLORS } from "@/lib/chart-colors"

export const TREND_COLORS = CHART_COLORS

export { formatByType as formatValue } from "@/lib/format"

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
