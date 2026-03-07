import React from "react"
import {
  BarChart3,
  Building,
  Calendar,
  CreditCard,
  Globe,
  Layers,
  Network,
  Shield,
  Tag,
  User,
  Users,
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

const selectOperators = [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.IS_ANY_OF]
const textOperators = [FilterOperators.IS, FilterOperators.IS_NOT, FilterOperators.INCLUDE, FilterOperators.DO_NOT_INCLUDE]
const dateOperators = [FilterOperators.AFTER, FilterOperators.BEFORE, FilterOperators.BEFORE_AND_EQUAL, FilterOperators.AFTER_AND_EQUAL]

interface FilterFieldDef {
  column: string
  icon: React.ReactNode
  type: "select" | "text" | "date"
  operators: string[]
  singleSelect?: boolean
  sortDesc?: boolean
  pinned?: boolean
}

const filterFields: Record<string, FilterFieldDef> = {
  hmsDesk:               { column: "hmsDesk",               icon: <BarChart3 className="size-3.5 text-cyan-500" />,         type: "select", operators: selectOperators },
  hmsSL1:                { column: "hmsSL1",                icon: <Globe className="size-3.5 text-violet-500" />,           type: "select", operators: selectOperators },
  hmsSL2:                { column: "hmsSL2",                icon: <Globe className="size-3.5 text-fuchsia-500" />,          type: "select", operators: selectOperators },
  tradeDt:                { column: "tradeDt",                icon: <Calendar className="size-3.5 text-yellow-500" />,        type: "date",   operators: dateOperators },
  maturityDt:             { column: "maturityDt",             icon: <Calendar className="size-3.5 text-red-500" />,           type: "date",   operators: dateOperators },
  tenor:                 { column: "tenor",                 icon: <Calendar className="size-3.5 text-green-500" />,         type: "select", operators: selectOperators },
  counterParty:          { column: "counterParty",          icon: <User className="size-3.5 text-orange-500" />,            type: "text",   operators: textOperators },
  
  productType:           { column: "productType",           icon: <Tag className="size-3.5 text-green-500" />,              type: "select", operators: selectOperators },
  hmsBook:               { column: "hmsBook",               icon: <Layers className="size-3.5 text-purple-500" />,          type: "select", operators: selectOperators },
  collateralDesc:        { column: "collateralDesc",        icon: <Shield className="size-3.5 text-indigo-500" />,          type: "text",   operators: textOperators },
  collatCurrency:        { column: "collatCurrency",        icon: <CreditCard className="size-3.5 text-teal-500" />,        type: "select", operators: selectOperators },
  issuerName:            { column: "issuerName",            icon: <Building className="size-3.5 text-blue-500" />,          type: "text",   operators: textOperators },
  counterpartyParentName:{ column: "counterpartyParentName",icon: <Users className="size-3.5 text-amber-500" />,            type: "text",   operators: textOperators },
  cpType:                { column: "cpType",                icon: <Network className="size-3.5 text-rose-500" />,           type: "select", operators: selectOperators },
  asofDate:              { column: "asofDate",              icon: <Calendar className="size-3.5 text-muted-foreground" />,   type: "select",   operators: [FilterOperators.IS], singleSelect: true, sortDesc: true, pinned: true },
}

// Derived maps consumed by RiskFilter
export const filterTypes = Object.fromEntries(
  Object.entries(filterFields).map(([k, v]) => [k, v.column]),
)

export const iconMapping: Record<string, React.ReactNode> = Object.fromEntries(
  Object.entries(filterFields).map(([k, v]) => [k, v.icon]),
)

export const operatorConfig: Record<string, { operators: string[]; type: string; field: string; singleSelect?: boolean; sortDesc?: boolean; pinned?: boolean }> = Object.fromEntries(
  Object.entries(filterFields).map(([k, v]) => [k, { operators: v.operators, type: v.type, field: v.column, singleSelect: v.singleSelect, sortDesc: v.sortDesc, pinned: v.pinned }]),
)

export const filterOperators: Record<string, string> = {
  "is": "=",
  "is not": "!=",
  "is any of": "IN",
  "include": "ILIKE",
  "do not include": "NOT ILIKE",
  "before": "<",
  "after": ">",
  "before & equal": "<=",
  "after & equal": ">=",
}

export const dateValues = [
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
]
