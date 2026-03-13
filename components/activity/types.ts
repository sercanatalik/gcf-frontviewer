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
  totalFunding: number
  totalCollateral: number
  avgSpread: number
  tradeCount: number
  clientCount: number
  bookCount: number
}

export interface NewTrade {
  tradeId: string
  counterParty: string
  productType: string
  side: string
  fundingAmount: number
  collateralAmount: number
  cashOut: number
  fundingMargin: number
  hmsDesk: string
  hms_region: string
  tradeDt: string
  maturityDt: string
  fundingCurrency: string
  collateralDesc: string
}

export interface ActivityData {
  grouped: GroupedRow[]
  tradeFlow: TradeFlow
  totals: {
    current: PeriodTotals
    previous: PeriodTotals
  }
  newTrades: NewTrade[]
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
