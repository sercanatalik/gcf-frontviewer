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
import { count } from "node:console"

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
  hmsRegion:               { column: F.hms_region,               icon: <Globe className="size-3.5 text-blue-500" />,            type: "select", operators: selectOperators },
  hmsDesk:               { column: F.hmsDesk,               icon: <BarChart3 className="size-3.5 text-cyan-500" />,         type: "select", operators: selectOperators },
  hmsSL1:                { column: F.hmsSL1,                icon: <Globe className="size-3.5 text-violet-500" />,           type: "select", operators: selectOperators },
  hmsSL2:                { column: F.hmsSL2,                icon: <Globe className="size-3.5 text-fuchsia-500" />,          type: "select", operators: selectOperators },
  balanceSheet:           { column: F.hms_leShortCode,           icon: <Layers className="size-3.5 text-pink-500" />,            type: "select", operators: selectOperators },
  tradingLocation:          { column: F.hms_tradingLocation,          icon: <User className="size-3.5 text-orange-500" />,            type: "text",   operators: textOperators },
  hmsBook:                { column: F.hmsBook,                icon: <Building className="size-3.5 text-yellow-500" />,         type: "select", operators: selectOperators },
  hmsRegulatatoryStatus:      { column: F.hms_regulatoryTmt,      icon: <Shield className="size-3.5 text-indigo-500" />,          type: "select", operators: selectOperators },
  productType:           { column: F.productType,           icon: <Tag className="size-3.5 text-green-500" />,              type: "select", operators: selectOperators },
  productSubType:        { column: F.productSubType,        icon: <Tag className="size-3.5 text-green-700" />,            type: "select", operators: selectOperators },
  

  counterpartyRegion:       { column: F.cp_region,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyCountry:      { column: F.cp_country,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyType:       { column: F.cp_type,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyCRR:       { column: F.cp_crr,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyRating:       { column: F.cp_ratingSnp,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },

  counterpartyName:       { column: F.counterpartyName,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyParent:       { column: F.counterpartyParent,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },
  counterpartyLTreats:       { column: F.counterParty,       icon: <Users className="size-3.5 text-blue-700" />,          type: "text",   operators: textOperators },

  collateralRegion:       { column: F.i_region,       icon: <Shield className="size-3.5 text-indigo-700" />,          type: "text",   operators: textOperators },
  collateralCounty:       { column: F.i_country,       icon: <Shield className="size-3.5 text-indigo-700" />,          type: "text",   operators: textOperators },
  collateralIssuer:       { column: F.i_issuerName,       icon: <CreditCard className="size-3.5 text-yellow-500" />,          type: "text",   operators: textOperators },
  collateralSector:       { column: F.i_industrySector,       icon: <Network className="size-3.5 text-red-500" />,          type: "text",   operators: textOperators },
  collateralCcy:          { column: F.i_instrumentCcy,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  collateralRating:       { column: F.i_rating,       icon: <Shield className="size-3.5 text-indigo-500" />,          type: "text",   operators: textOperators },
  collateralType:         { column: F.i_collateralType,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  collateralQuality:      { column: F.i_collatQuality,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  collateralPalmCode:       { column: F.i_palmsCode,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  collateralName:       { column: F.collateralDesc,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  colleteralIsin:       { column: F.collateralId,       icon: <CreditCard className="size-3.5 text-yellow-700" />,          type: "text",   operators: textOperators },
  
  asOfDate:              { column: F.asOfDate,              icon: <Calendar className="size-3.5 text-muted-foreground" />,   type: "select",   operators: [FilterOperators.IS], singleSelect: true, sortDesc: true, pinned: true },
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
