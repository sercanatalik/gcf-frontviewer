import React from "react"
import {
  BarChart3,
  Target,
  Building,
  User,
  Clock,
  MapPin,
  Shield,
  Layers,
} from "lucide-react"

export const FilterOperators = {
  IS: "is",
  IS_NOT: "is not",
  IS_ANY_OF: "is any of",
  INCLUDE: "include",
  DO_NOT_INCLUDE: "do not include",
  BEFORE: "before",
  AFTER: "after",
  BEFORE_AND_EQUAL: "before & equal",
  AFTER_AND_EQUAL: "after & equal",
}

export const riskFilterConfig = {
  filterTypes: {
    "desk": "desk",
    "book_name": "book_name",
    "counterparty_name": "counterparty_name",
    "trade_type": "trade_type",
    "asset_class": "asset_class",
    "collateral_type": "collateral_type",
    "rating": "rating",
    "book_region": "book_region",
    "trade_dt": "trade_dt",
  } as Record<string, string>,

  filterOperators: {
    "is": "=",
    "is not": "!=",
    "is any of": "IN",
    "include": "ILIKE",
    "do not include": "NOT ILIKE",
    "before": "<",
    "after": ">",
    "before & equal": "<=",
    "after & equal": ">=",
  } as Record<string, string>,

  iconMapping: {
    "desk": <Building className="size-3.5 text-blue-500" />,
    "book_name": <Layers className="size-3.5 text-purple-500" />,
    "counterparty_name": <User className="size-3.5 text-orange-500" />,
    "trade_type": <BarChart3 className="size-3.5 text-green-500" />,
    "asset_class": <Target className="size-3.5 text-yellow-500" />,
    "collateral_type": <Shield className="size-3.5 text-indigo-500" />,
    "rating": <Shield className="size-3.5 text-red-500" />,
    "book_region": <MapPin className="size-3.5 text-teal-500" />,
    "trade_dt": <Clock className="size-3.5 text-muted-foreground" />,
  } as Record<string, React.ReactNode>,

  operatorConfig: {
    "desk": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "desk",
    },
    "book_name": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "book_name",
    },
    "counterparty_name": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.INCLUDE, FilterOperators.DO_NOT_INCLUDE],
      type: "text",
      field: "counterparty_name",
    },
    "trade_type": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "trade_type",
    },
    "asset_class": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "asset_class",
    },
    "collateral_type": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "collateral_type",
    },
    "rating": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "rating",
    },
    "book_region": {
      operators: [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF],
      type: "select",
      field: "book_region",
    },
    "trade_dt": {
      operators: [FilterOperators.AFTER, FilterOperators.BEFORE, FilterOperators.BEFORE_AND_EQUAL, FilterOperators.AFTER_AND_EQUAL],
      type: "date",
      field: "trade_dt",
    },
  } as Record<string, any>,

  dateValues: [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Quarter",
    "Last Quarter",
    "This Year",
    "Last Year",
  ],

  tableName: "risk_mv",
}

export const {
  filterTypes,
  filterOperators,
  iconMapping,
  operatorConfig,
  dateValues,
} = riskFilterConfig
