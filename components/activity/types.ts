export interface GroupedRow {
  group: string
  currentFunding: number
  previousFunding: number
  currentCollateral: number
  previousCollateral: number
  currentSpread: number
  previousSpread: number
  currentTradeCount: number
  previousTradeCount: number
}

export interface TradeFlow {
  newTrades: number
  maturedTrades: number
  rolledTrades: number
  totalCurrent: number
  totalPrevious: number
}

export interface PeriodTotals {
  period: string
  asOfDate: string
  fundingAmount: number
  collateralAmount: number
  avgSpread: number
  tradeCount: number
  clientCount: number
  bookCount: number
}

export interface ActivityData {
  grouped: GroupedRow[]
  tradeFlow: TradeFlow
  totals: {
    current: PeriodTotals
    previous: PeriodTotals
  }
  meta: {
    groupBy: string
    daysAgo: number
  }
}

import type { FieldName } from "@/lib/field-defs"

export interface DimensionOption {
  value: FieldName
  label: string
}
