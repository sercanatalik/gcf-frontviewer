export interface KpiMeasure {
  key: string
  label: string
  field: string
  aggregation: "sum" | "count" | "avg" | "max" | "min" | "countDistinct" | "avgBy"
  weightField?: string
  formatter: "currency" | "bps" | "days" | "count"
}

export interface KpiStatData {
  current: number
  previous: number
  change: number
  changePercent: number
}
