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
import { F } from "@/lib/field-defs"

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
  hmsDesk:               { column: F.hmsDesk,               icon: <BarChart3 className="size-3.5 text-cyan-500" />,         type: "select", operators: selectOperators },
  hmsSL1:                { column: F.hmsSL1,                icon: <Globe className="size-3.5 text-violet-500" />,           type: "select", operators: selectOperators },
  hmsSL2:                { column: F.hmsSL2,                icon: <Globe className="size-3.5 text-fuchsia-500" />,          type: "select", operators: selectOperators },
  tradeDt:               { column: F.tradeDt,               icon: <Calendar className="size-3.5 text-yellow-500" />,        type: "date",   operators: dateOperators },
  maturityDt:            { column: F.maturityDt,            icon: <Calendar className="size-3.5 text-red-500" />,           type: "date",   operators: dateOperators },
  tenor:                 { column: F.tenor,                 icon: <Calendar className="size-3.5 text-green-500" />,         type: "select", operators: selectOperators },
  counterParty:          { column: F.counterParty,          icon: <User className="size-3.5 text-orange-500" />,            type: "text",   operators: textOperators },

  productType:           { column: F.productType,           icon: <Tag className="size-3.5 text-green-500" />,              type: "select", operators: selectOperators },
  hmsBook:               { column: F.hmsBook,               icon: <Layers className="size-3.5 text-purple-500" />,          type: "select", operators: selectOperators },
  collateralDesc:        { column: F.collateralDesc,        icon: <Shield className="size-3.5 text-indigo-500" />,          type: "text",   operators: textOperators },
  collatCurrency:        { column: F.collatCurrency,        icon: <CreditCard className="size-3.5 text-teal-500" />,        type: "select", operators: selectOperators },
  i_issuerName:          { column: F.i_issuerName,          icon: <Building className="size-3.5 text-blue-500" />,          type: "text",   operators: textOperators },
  counterpartyParentName:{ column: F.counterpartyParentName,icon: <Users className="size-3.5 text-amber-500" />,            type: "text",   operators: textOperators },
  cp_type:               { column: F.cp_type,               icon: <Network className="size-3.5 text-rose-500" />,           type: "select", operators: selectOperators },
  asofDate:              { column: F.asofDate,              icon: <Calendar className="size-3.5 text-muted-foreground" />,   type: "select",   operators: [FilterOperators.IS], singleSelect: true, sortDesc: true, pinned: true },
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
