import React from "react"
import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Coins,
  Computer,
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
  label: string
  icon: React.ReactNode
  type: "select" | "text" | "date"
  operators: string[]
  singleSelect?: boolean
  sortDesc?: boolean
  pinned?: boolean
}

const filterFields: Record<string, FilterFieldDef> = {
  // --- HMS / Book (blue) ---
  hmsRegion:              { column: F.hms_region,          label: "Region",            icon: <Globe className="size-3.5 text-blue-500" />,      type: "select", operators: selectOperators },
  hmsDesk:                { column: F.hmsDesk,             label: "Desk",              icon: <Briefcase className="size-3.5 text-blue-500" />,  type: "select", operators: selectOperators },
  hmsSL1:                 { column: F.hmsSL1,              label: "SL1",               icon: <Layers className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  hmsSL2:                 { column: F.hmsSL2,              label: "SL2",               icon: <Layers className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  balanceSheet:           { column: F.hms_leShortCode,     label: "Balance Sheet",     icon: <Landmark className="size-3.5 text-blue-500" />,   type: "select", operators: selectOperators },
  tradingLocation:        { column: F.hms_tradingLocation, label: "Trading Location",  icon: <MapPin className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  hmsBook:                { column: F.hmsBook,             label: "Book",              icon: <BookOpen className="size-3.5 text-blue-500" />,   type: "select", operators: selectOperators },
  hmsRegulatatoryStatus:  { column: F.hms_regulatoryTmt,   label: "Regulatory Status", icon: <Scale className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  hmsSystem:            { column: F.hms_system,          label: "System/PTS",            icon: <Computer className="size-3.5 text-blue-500" />,      type: "select", operators: selectOperators },
  hmsPortfolio:           { column: F.hmsPortfolio,       label: "Portfolio",             icon: <Briefcase className="size-3.5 text-blue-500" />,     type: "select", operators: selectOperators },
  hmsPrimaryTrader:     { column: F.hms_primaryTrader,   label: "Primary Trader",        icon: <User className="size-3.5 text-blue-500" />,         type: "select", operators: selectOperators },


  // --- Product (green) ---
  productType:            { column: F.productType,         label: "Type",              icon: <Package className="size-3.5 text-green-500" />,   type: "select", operators: selectOperators },
  productSubType:         { column: F.productSubType,      label: "Sub Type",          icon: <Tag className="size-3.5 text-green-500" />,       type: "select", operators: selectOperators },
  productFundingType:      { column: F.fundingType, label: "Funding Type",      icon: <Coins className="size-3.5 text-green-500" />,     type: "select", operators: selectOperators },

  // --- Counterparty (violet) ---
  counterpartyRegion:     { column: F.cp_region,           label: "Region",            icon: <Globe className="size-3.5 text-violet-500" />,    type: "select", operators: selectOperators },
  counterpartyCountry:    { column: F.cp_country,          label: "Country",           icon: <Flag className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyType:       { column: F.cp_type,             label: "Type",              icon: <Users className="size-3.5 text-violet-500" />,    type: "select", operators: selectOperators },
  counterpartyCRR:        { column: F.cp_crr,              label: "CRR",               icon: <Shield className="size-3.5 text-violet-500" />,   type: "select", operators: selectOperators },
  counterpartyRating:     { column: F.cp_ratingSnp,        label: "Rating (S&P)",      icon: <Star className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyName:       { column: F.counterpartyName,    label: "Name",              icon: <User className="size-3.5 text-violet-500" />,     type: "select", operators: selectOperators },
  counterpartyParent:     { column: F.counterpartyParent,  label: "Parent",            icon: <UserCheck className="size-3.5 text-violet-500" />, type: "select", operators: selectOperators },
  counterpartyLTreats:    { column: F.counterParty,        label: "LTreats",           icon: <Building className="size-3.5 text-violet-500" />, type: "select", operators: selectOperators },

  // --- Collateral (amber) ---
  collateralRegion:       { column: F.i_region,            label: "Region",            icon: <Globe className="size-3.5 text-amber-500" />,     type: "select", operators: selectOperators },
  collateralCounty:       { column: F.i_country,           label: "Country",           icon: <Flag className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralIssuer:       { column: F.i_issuerName,        label: "Issuer",            icon: <Factory className="size-3.5 text-amber-500" />,   type: "select", operators: selectOperators },
  collateralSector:       { column: F.i_industrySector,    label: "Sector",            icon: <Briefcase className="size-3.5 text-amber-500" />, type: "select", operators: selectOperators },
  collateralCcy:          { column: F.i_instrumentCcy,     label: "Currency",          icon: <Coins className="size-3.5 text-amber-500" />,     type: "select", operators: selectOperators },
  collateralRating:       { column: F.i_rating,            label: "Rating",            icon: <Star className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralType:         { column: F.i_collateralType,    label: "Type",              icon: <Tag className="size-3.5 text-amber-500" />,       type: "select", operators: selectOperators },
  collateralQuality:      { column: F.i_collatQuality,     label: "Quality",           icon: <Shield className="size-3.5 text-amber-500" />,    type: "select", operators: selectOperators },
  collateralPalmCode:     { column: F.i_palmsCode,         label: "PALM Code",         icon: <Hash className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },
  collateralName:         { column: F.collateralDesc,      label: "Name",              icon: <Landmark className="size-3.5 text-amber-500" />,  type: "select", operators: selectOperators },
  colleteralIsin:         { column: F.collateralId,        label: "ISIN",              icon: <Hash className="size-3.5 text-amber-500" />,      type: "select", operators: selectOperators },

  // --- Date ---
  asOfDate:               { column: F.asOfDate,            label: "As Of Date",        icon: <Calendar className="size-3.5 text-muted-foreground" />, type: "select", operators: [FilterOperators.IS], singleSelect: true, sortDesc: true, pinned: true },
}

// ---------------------------------------------------------------------------
// Group definitions
// ---------------------------------------------------------------------------

export interface FilterGroupDef {
  key: string
  label: string
  color: string
  fields: string[]
}

export const filterGroups: FilterGroupDef[] = [
  {
    key: "hms",
    label: "HMS / Book",
    color: "blue",
    fields: ["hmsRegion", "hmsDesk", "hmsSL1", "hmsSL2", "balanceSheet", "tradingLocation", "hmsBook", "hmsRegulatatoryStatus", "hmsSystem", "hmsPortfolio", "hmsPrimaryTrader"],
  },
  {
    key: "product",
    label: "Product",
    color: "green",
    fields: ["productType", "productSubType", "productFundingType"],
  },
  {
    key: "counterparty",
    label: "Counterparty",
    color: "violet",
    fields: ["counterpartyRegion", "counterpartyCountry", "counterpartyType", "counterpartyCRR", "counterpartyRating", "counterpartyName", "counterpartyParent", "counterpartyLTreats"],
  },
  {
    key: "collateral",
    label: "Collateral",
    color: "amber",
    fields: ["collateralRegion", "collateralCounty", "collateralIssuer", "collateralSector", "collateralCcy", "collateralRating", "collateralType", "collateralQuality", "collateralPalmCode", "collateralName", "colleteralIsin"],
  },
]

// Group color styles (static for Tailwind JIT)
export const GROUP_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  blue:   { dot: "bg-blue-500",   bg: "bg-blue-500/10",  text: "text-blue-500" },
  green:  { dot: "bg-green-500",  bg: "bg-green-500/10", text: "text-green-500" },
  violet: { dot: "bg-violet-500", bg: "bg-violet-500/10", text: "text-violet-500" },
  amber:  { dot: "bg-amber-500",  bg: "bg-amber-500/10", text: "text-amber-500" },
}

// ---------------------------------------------------------------------------
// Derived maps consumed by RiskFilter / filter-controls
// ---------------------------------------------------------------------------

export const filterTypes = Object.fromEntries(
  Object.entries(filterFields).map(([k, v]) => [k, v.column]),
)

export const filterLabels: Record<string, string> = Object.fromEntries(
  Object.entries(filterFields).map(([k, v]) => [k, v.label]),
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
