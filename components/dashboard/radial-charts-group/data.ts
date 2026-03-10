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
    groupBy: "cp_type",
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
    key: "collateralByRegion",
    title: "Collateral by Region",
    description: "Collateral amount by region",
    measure: { field: "collateralAmount", aggregation: "sum" },
    groupBy: "hms_region",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "wrongWayRisk",
    title: "Wrong Way Risk",
    description: "Wrong Way Risk by Country",
    measure: { field: "fundingAmount", aggregation: "sum" },
    groupBy: "i_countryOfRisk",
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
]
