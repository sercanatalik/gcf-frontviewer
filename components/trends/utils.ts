export const TREND_COLORS = [
  "oklch(0.70 0.15 250)",
  "oklch(0.60 0.20 200)",
  "oklch(0.65 0.18 150)",
  "oklch(0.55 0.22 300)",
  "oklch(0.72 0.12 50)",
  "oklch(0.50 0.20 270)",
  "oklch(0.68 0.14 100)",
  "oklch(0.58 0.16 350)",
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
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function sanitizeKey(key: string): string {
  return String(key).replace(/[^a-zA-Z0-9]/g, "_")
}

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
