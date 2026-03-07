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

export const radialCharts: RadialChartDef[] = [
  {
    key: "fundingByProduct",
    title: "Funding by Product",
    description: "Funding amount distribution",
    measure: { field: "fundingAmount", aggregation: "sum" },
    groupBy: "productType",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "cashOutByCpType",
    title: "Cash Out by CP Type",
    description: "Cash out by counterparty type",
    measure: { field: "cashOut", aggregation: "sum" },
    groupBy: "cpType",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "collateralByCurrency",
    title: "Collateral by Currency",
    description: "Collateral amount by currency",
    measure: { field: "collateralAmount", aggregation: "sum" },
    groupBy: "collatCurrency",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "spreadByProduct",
    title: "Spread by Product",
    description: "Weighted avg spread",
    measure: { field: "fundingMargin", aggregation: "avgBy", weightField: "fundingAmount" },
    groupBy: "productType",
    limit: 6,
    centerLabel: "Avg",
    formatter: "bps",
  },
    {
    key: "WrongWayRisk",
    title: "Wrong Way Risk",
    description: "Wrong Way Risk by Country",
    measure: { field: "fundingAmount", aggregation: "sum" },
    groupBy: "countryOfRisk",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  }
]
