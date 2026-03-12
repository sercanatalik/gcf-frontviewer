export interface RadialChartDef {
  key: string
  title: string
  description: string
  measure: {
    field: string
    aggregation: string
    weightField?: string
  }
  groupBy: string
  limit?: number
  centerLabel: string
  formatter: "currency" | "count" | "bps" | "days"
}

export { radialCharts } from "@/lib/field-defs"
