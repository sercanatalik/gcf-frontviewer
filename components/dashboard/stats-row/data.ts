import type { StatMeasure } from "./types"

export const statMeasures: StatMeasure[] = [
  { key: "trades", label: "Trades", field: "tradeId", aggregation: "count", icon: "Copy", color: "hsl(217, 91%, 60%)" },
  { key: "clients", label: "Clients", field: "counterParty", aggregation: "countDistinct", icon: "Users", color: "hsl(221, 83%, 53%)" },
  { key: "assets", label: "Assets", field: "collateralDesc", aggregation: "countDistinct", icon: "Briefcase", color: "hsl(224, 76%, 48%)" },
  { key: "collateralCcy", label: "Collateral Ccy", field: "collatCurrency", aggregation: "countDistinct", icon: "Coins", color: "hsl(226, 71%, 40%)" },
  { key: "fundingCcy", label: "Funding Ccy", field: "fundingCurrency", aggregation: "countDistinct", icon: "DollarSign", color: "hsl(217, 60%, 68%)" },
  { key: "books", label: "Books", field: "hmsBook", aggregation: "countDistinct", icon: "BookOpen", color: "hsl(217, 91%, 60%)" },
  { key: "traders", label: "Traders", field: "primaryTrader", aggregation: "countDistinct", icon: "UserCheck", color: "hsl(221, 83%, 53%)" },
]

export const DEFAULT_RELATIVE_DAYS = 180
