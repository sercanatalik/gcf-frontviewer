export interface RadialChartDef {
  key: string
  title: string
  description: string
  measures: {
    primary: { key: string; field: string; aggregation: string; label: string; color: string; weightField?: string }
    secondary: { key: string; field: string; aggregation: string; label: string; color: string; weightField?: string }
  }
  centerLabel: string
  formatter: "currency" | "count" | "bps" | "days"
}

export const radialCharts: RadialChartDef[] = [
  {
    key: "fundingVsCollateral",
    title: "Funding vs Collateral",
    description: "Total amounts comparison",
    measures: {
      primary: { key: "fundingAmt", field: "fundingAmount", aggregation: "sum", label: "Funding", color: "hsl(217, 91%, 60%)" },
      secondary: { key: "collateralAmt", field: "collateralAmount", aggregation: "sum", label: "Collateral", color: "hsl(221, 83%, 53%)" },
    },
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "cashOutVsExposure",
    title: "Cash Out vs Exposure",
    description: "Cash out and financing exposure",
    measures: {
      primary: { key: "cashOutVal", field: "cashOut", aggregation: "sum", label: "Cash Out", color: "hsl(142, 71%, 45%)" },
      secondary: { key: "exposureVal", field: "financingExposure", aggregation: "sum", label: "Exposure", color: "hsl(0, 84%, 60%)" },
    },
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "accruals",
    title: "Projected vs Realized",
    description: "Accrual comparison",
    measures: {
      primary: { key: "projectedAcc", field: "accrualProjected", aggregation: "sum", label: "Projected", color: "hsl(262, 83%, 58%)" },
      secondary: { key: "realisedAcc", field: "accrualRealised", aggregation: "sum", label: "Realized", color: "hsl(280, 65%, 60%)" },
    },
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "spreadVsMaturity",
    title: "Spread vs Maturity",
    description: "Weighted averages",
    measures: {
      primary: { key: "avgSpreadVal", field: "fundingMargin", aggregation: "avgBy", label: "Spread (bps)", color: "hsl(30, 90%, 55%)" , weightField: "fundingAmount" },
      secondary: { key: "avgMaturityVal", field: "dtm", aggregation: "avgBy", label: "Maturity (days)", color: "hsl(45, 85%, 50%)", weightField: "fundingAmount" },
    },
    centerLabel: "Avg",
    formatter: "count",
  },
]
