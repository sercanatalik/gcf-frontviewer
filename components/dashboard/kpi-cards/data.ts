import type { KpiMeasure } from "./types"

export const kpiMeasures: KpiMeasure[] = [
  {
    key: "cashOut",
    label: "Cash Out",
    field: "cashOut",
    aggregation: "sum",
    formatter: "currency",
  },
  {
    key: "fundingAmount",
    label: "Funding Amount",
    field: "fundingAmount",
    aggregation: "sum",
    formatter: "currency",
  },
  {
    key: "collateralAmount",
    label: "Collateral Amount",
    field: "collateralAmount",
    aggregation: "sum",
    formatter: "currency",
  },
  {
    key: "avgSpread",
    label: "Average Spread",
    field: "fundingMargin",
    aggregation: "avgBy",
    weightField: "fundingAmount",
    formatter: "bps",
  },
  {
    key: "avgMaturity",
    label: "Average Maturity",
    field: "dtm",
    aggregation: "avgBy",
    weightField: "fundingAmount",
    formatter: "days",
  },
  {
    key: "dailyAccrual",
    label: "Daily Accrual",
    field: "accrualDaily",
    aggregation: "sum",
    formatter: "currency",
  },
  {
    key: "projectedAccrual",
    label: "Projected Accrual",
    field: "accrualProjected",
    aggregation: "sum",
    formatter: "currency",
  },
  {
    key: "realisedAccrual",
    label: "Realized Accrual",
    field: "accrualRealised",
    aggregation: "sum",
    formatter: "currency",
  },
]

export const DEFAULT_RELATIVE_DAYS = 180
