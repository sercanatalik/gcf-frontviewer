export interface StatMeasure {
  key: string
  label: string
  field: string
  aggregation: "countDistinct" | "count"
  icon: string
  color: string
}

export interface StatData {
  current: number
  previous: number
  delta: number
}
