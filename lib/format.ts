/**
 * Shared number formatting utilities.
 *
 * Every component that needs to format currency, bps, percentages, or
 * plain numbers should import from here to keep formatting consistent.
 */

export function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatCurrencyWithSign(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : "+"
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatCurrencyCompact(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function formatBps(value: number): string {
  return `${(value * 100).toFixed(2)} bps`
}

export function formatBpsRaw(value: number): string {
  return `${value.toFixed(1)} bps`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

export function formatDays(value: number): string {
  return `${value.toFixed(0)}d`
}

export function formatCount(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()
}

export function calcChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Format a value using a named formatter type.
 * Use this when the formatter is determined at runtime (e.g. chart configs).
 */
export function formatByType(value: number, formatter: string): string {
  switch (formatter) {
    case "currency":
      return formatCurrencyCompact(value)
    case "bps":
      return formatBpsRaw(value)
    case "percent":
      return `${value.toFixed(1)}%`
    case "days":
      return formatDays(value)
    case "count":
      return formatCount(value)
    default:
      return value.toLocaleString()
  }
}
