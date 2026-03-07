import type { KpiMeasure, KpiStatData } from "./types"

export function formatKpiValue(value: number, formatter: KpiMeasure["formatter"]): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  switch (formatter) {
    case "currency": {
      if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
      if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
      if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
      return `${sign}$${Math.round(abs)}`
    }
    case "bps":
      return `${(value * 100).toFixed(2)}bps`
    case "days":
      return `${Math.round(value)} days`
    case "count":
      return Math.round(value).toLocaleString("en-US")
  }
}

export function formatDelta(changePercent: number): string {
  const sign = changePercent >= 0 ? "+" : ""
  return `${sign}${changePercent.toFixed(1)}%`
}

export function formatFooter(
  data: KpiStatData,
  formatter: KpiMeasure["formatter"],
  relativeDays: number,
): { label: string; description: string } {
  const direction = data.change >= 0 ? "Up" : "Down"
  const changeStr = formatKpiValue(Math.abs(data.change), formatter)
  return {
    label: `${direction} ${changeStr} this period`,
    description: `Compared to ${relativeDays} days ago`,
  }
}
