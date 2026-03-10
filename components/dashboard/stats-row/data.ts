import type { StatMeasure } from "./types"

export const statMeasures: StatMeasure[] = [
  { key: "trades", label: "Trades", field: "tradeId", aggregation: "count", icon: "Copy", color: "oklch(0.62 0.17 255)" },
  { key: "clients", label: "Clients", field: "counterParty", aggregation: "countDistinct", icon: "Users", color: "oklch(0.55 0.20 260)" },
  { key: "assets", label: "Assets", field: "collateralDesc", aggregation: "countDistinct", icon: "Briefcase", color: "oklch(0.60 0.16 170)" },
  { key: "collateralCcy", label: "Collateral Ccy", field: "collatCurrency", aggregation: "countDistinct", icon: "Coins", color: "oklch(0.65 0.15 50)" },
  { key: "fundingCcy", label: "Funding Ccy", field: "fundingCurrency", aggregation: "countDistinct", icon: "DollarSign", color: "oklch(0.58 0.18 300)" },
  { key: "books", label: "Books", field: "hmsBook", aggregation: "countDistinct", icon: "BookOpen", color: "oklch(0.55 0.15 230)" },
  { key: "traders", label: "Traders", field: "hms_primaryTrader", aggregation: "countDistinct", icon: "UserCheck", color: "oklch(0.60 0.14 200)" },
]

export const DEFAULT_RELATIVE_DAYS = 180
