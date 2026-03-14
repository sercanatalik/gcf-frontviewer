import React from "react"
import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Coins,
  Factory,
  Flag,
  Globe,
  Hash,
  Landmark,
  Layers,
  MapPin,
  Package,
  Scale,
  Shield,
  Star,
  Tag,
  User,
  UserCheck,
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
  // --- HMS / Book (blue) ---
  hmsRegion:              { column: F.hms_region,          icon: <Globe className="size-3.5 text-blue-500" />,      type: "select", operators: selectOperators },
  hmsDesk:                { column: F.hmsDesk,             icon: <Briefcase className="size-3.5 text-blue-500" />,  type: "select", operators: selectOperators },
  hmsSL1:                 { column: F.hmsSL1,              icon: <Layers className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  hmsSL2:                 { column: F.hmsSL2,              icon: <Layers className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  balanceSheet:           { column: F.hms_leShortCode,     icon: <Landmark className="size-3.5 text-blue-500" />,   type: "select", operators: selectOperators },
  tradingLocation:        { column: F.hms_tradingLocation,  icon: <MapPin className="size-3.5 text-blue-500" />,    type: "select", operators: selectOperators },
  hmsBook:                { column: F.hmsBook,             icon: <BookOpen className="size-3.5 text-blue-500" />,   type: "select", operators: selectOperators },
  hmsRegulatatoryStatus:  { column: F.hms_regulatoryTmt,   icon: <Scale className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },

  // --- Product (green) ---
  productType:            { column: F.productType,         icon: <Package className="size-3.5 text-green-500" />,   type: "select", operators: selectOperators },
  productSubType:         { column: F.productSubType,      icon: <Tag className="size-3.5 text-green-500" />,       type: "select", operators: selectOperators },

  // --- Counterparty (violet) ---
  counterpartyRegion:     { column: F.cp_region,           icon: <Globe className="size-3.5 text-violet-500" />,    type: "select", operators: selectOperators },
  counterpartyCountry:    { column: F.cp_country,          icon: <Flag className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyType:       { column: F.cp_type,             icon: <Users className="size-3.5 text-violet-500" />,    type: "select", operators: selectOperators },
  counterpartyCRR:        { column: F.cp_crr,              icon: <Shield className="size-3.5 text-violet-500" />,   type: "select", operators: selectOperators },
  counterpartyRating:     { column: F.cp_ratingSnp,        icon: <Star className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyName:       { column: F.counterpartyName,    icon: <User className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyParent:     { column: F.counterpartyParent,  icon: <UserCheck className="size-3.5 text-violet-500" />, type: "select", operators: selectOperators },
  counterpartyLTreats:    { column: F.counterParty,        icon: <Building className="size-3.5 text-violet-500" />, type: "select", operators: selectOperators },

  // --- Collateral (amber) ---
  collateralRegion:       { column: F.i_region,            icon: <Globe className="size-3.5 text-amber-500" />,     type: "select", operators: selectOperators },
  collateralCounty:       { column: F.i_country,           icon: <Flag className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralIssuer:       { column: F.i_issuerName,        icon: <Factory className="size-3.5 text-amber-500" />,   type: "select", operators: selectOperators },
  collateralSector:       { column: F.i_industrySector,    icon: <Briefcase className="size-3.5 text-amber-500" />, type: "select", operators: selectOperators },
  collateralCcy:          { column: F.i_instrumentCcy,     icon: <Coins className="size-3.5 text-amber-500" />,     type: "select", operators: selectOperators },
  collateralRating:       { column: F.i_rating,            icon: <Star className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralType:         { column: F.i_collateralType,    icon: <Tag className="size-3.5 text-amber-500" />,       type: "select", operators: selectOperators },
  collateralQuality:      { column: F.i_collatQuality,     icon: <Shield className="size-3.5 text-amber-500" />,    type: "select", operators: selectOperators },
  collateralPalmCode:     { column: F.i_palmsCode,         icon: <Hash className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralName:         { column: F.collateralDesc,      icon: <Landmark className="size-3.5 text-amber-500" />,  type: "select", operators: selectOperators },
  colleteralIsin:         { column: F.collateralId,        icon: <Hash className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },

  // --- Date ---
  asOfDate:               { column: F.asOfDate,            icon: <Calendar className="size-3.5 text-muted-foreground" />, type: "select", operators: [FilterOperators.IS], singleSelect: true, sortDesc: true, pinned: true },
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
