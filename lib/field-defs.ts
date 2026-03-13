/**
 * Centralised ClickHouse field / column definitions.
 *
 * Every dashboard component, filter, chart, and API route references column
 * names through this file.  When a column is renamed in the database, update
 * it here and the change propagates everywhere.
 */

// ---------------------------------------------------------------------------
// 1. Column name constants  (the single source of truth)
// ---------------------------------------------------------------------------

/** Core monetary / exposure fields */
export const F = {
  // identifiers & status
  tradeId: "tradeId",
  asofDate: "asofDate",
  snapId: "snapId",
  id: "id",
  tradeStatus: "status",
  side: "side",
  version: "version",
  pts: "pts",

  // product
  productType: "productType",
  productSubType: "productSubType",
  hms_assetClass: "hms_assetClass",

  // dates
  tradeDt: "tradeDt",
  startDt: "startDt",
  maturityDt: "maturityDt",
  maturityIsOpen: "maturityIsOpen",
  executionDt: "executionDt",
  calculatedAt: "calculatedAt",
  updatedAt: "t_updatedAt",

  // amounts
  fundingAmount: "fundingAmount",
  fundingAmountLCY: "fundingAmountLCY",
  collateralAmount: "collateralAmount",
  collateralAmountLCY: "collateralAmountLCY",
  financingExposure: "financingExposure",
  cashOut: "cashOut",
  outstandingAmt: "outstandingAmt",
  iaAmount: "iaAmount",
  t_iaAmount: "t_iaAmount",
  iaCcy: "t_iaCcy",

  // funding terms
  fundingMargin: "t_fundingMargin",
  fixedRate: "t_fixedRate",
  fundingType: "fundingType",
  fundingCurrency: "t_fundingCurrency",
  fundingFixingLabel: "t_fundingFixingLabel",
  haircut: "haircut",
  sideFactorFunding: "sideFactorFunding",
  sideFactorCollateral: "sideFactorCollateral",
  fixingBondPrice: "fixingBondPrice",
  fixingFx: "fixingFx",

  // collateral
  collateralDesc: "t_collateralDesc",
  collateralType: "i_collateralType",
  collateralId: "t_collateralId",
  collatCurrency: "t_collatCurrency",
  payoutCurrency: "t_payoutCurrency",
  i_desc: "i_desc",
  i_type: "i_type",
  i_coupon: "i_coupon",
  i_instrumentCcy: "i_instrumentCcy",
  i_maturityDt: "i_maturityDt",
  i_outstandingAmt: "i_outstandingAmt",
  i_collatQuality: "i_collatQuality",
  i_collateralType: "i_collateralType",

  // instrument identifiers
  i_isinId: "i_isinId",
  i_bbgId: "i_bbgId",
  i_ticker: "i_ticker",
  i_palmsCode: "i_palmsCode",

  // instrument geography & classification
  i_country: "i_country",
  i_region: "i_region",
  i_industrySector: "i_industrySector",
  i_rating: "i_rating",
  i_countryOfRisk: "i_countryOfRisk",

  // issuer
  i_issuerName: "i_issuerName",
  i_issuerLei: "i_issuerLei",

  // counterparty
  counterParty: "counterParty",
  counterpartyName: "counterpartyName",
  counterpartyParent: "counterpartyParent",
  counterpartyParentName: "counterpartyParent",
  cp_type: "cp_type",
  cp_ratingMoodys: "cp_ratingMoodys",
  cp_ratingSnp: "cp_ratingSnP",
  cp_crr: "cp_crr",
  cp_lei: "cp_lei",
  cp_country: "cp_country",
  cp_region: "cp_region",
  cp_countryIncorporation: "cp_countryIncorporation",
  cp_countryOperation: "cp_countryOperation",
  cp_treatsParent: "cp_treatsParent",

  // wrong way risk
  isWWR: "isWWR",

  // trading / book
  hmsDesk: "hmsDesk",
  hmsBook: "hmsBook",
  hmsPortfolio: "hmsPortfolio",
  hmsSL1: "hmsSL1",
  hmsSL2: "hmsSL2",
  hmsSL3: "hmsSL3",
  hms_primaryTrader: "hms_primaryTrader",
  hms_primarySupervisor: "hms_primarySupervisor",
  hms_region: "hms_region",
  hms_subRegion: "hms_subRegion",
  hms_subSubRegion: "hms_subSubRegion",
  hms_subSubSubRegion: "hms_subSubSubRegion",
  hms_tradingLocation: "hms_tradingLocation",
  hms_bookCategory: "hms_bookCategory",
  hms_leName: "hms_leName",
  hms_leCurrency: "hms_leCurrency",
  hms_leHolding: "hms_leHolding",
  hms_leEntity: "hms_leEntity",
  hms_leShortCode: "hms_leShortCode",
  hms_costCentre: "hms_costCentre",
  hms_system: "hms_system",
  hms_businessLine: "hms_businessLine",
  hms_globalBusiness: "hms_globalBusiness",
  hms_deskGuid: "hms_deskGuid",
  hms_bookGuid: "hms_bookGuid",
  hms_trouxId: "hms_trouxId",
  hms_volckerDeskCode: "hms_volckerDeskCode",
  hms_regulatoryTmt: "hms_regulatoryTmt",
  hms_globalAccountingTmt: "hms_globalAccountingTmt",
  hms_globalRegulatoryTmt: "hms_globalRegulatoryTmt",
  hms_regionalReportingCurrency: "hms_regionalReportingCurrency",
  hms_pnlFeed: "hms_pnlFeed",
  hms_saContributory: "hms_saContributory",

  // fx
  fxSpot: "fxSpot",
  fxSpotFunding: "fxSpotFunding",
  fxSpotEOD: "fxSpotEOD",
  fxPair: "t_fxPair",
  fxPairFunding: "t_fxPairFunding",

  // risk
  dtm: "dtm",
  age: "age",
  tenor: "tenor",
  realisedMarginCall: "realisedMarginCall",
  expectedMarginCall: "expectedMarginCall",

  // accruals
  accrualDaily: "accrualDaily",
  accrualProjected: "accrualProjected",
  accrualRealised: "accrualRealised",

  // evergreen / extendible
  maturityIsEvergreen: "t_maturityIsEvergreen",
  everGreenTerm: "t_everGreenTerm",
  everGreenAutoroll: "t_everGreenAutoroll",
  isExtendible: "t_isExtendible",
} as const

export type FieldKey = keyof typeof F
export type FieldName = (typeof F)[FieldKey]

/**
 * Resolve a field key (used in URLs/frontend) to the actual DB column name.
 * If the value is already a DB column name, returns it as-is.
 */
const _fieldLookup: Record<string, string> = Object.fromEntries(
  Object.entries(F).flatMap(([key, val]) =>
    key === val ? [[key, val]] : [[key, val], [val, val]],
  ),
)
export function resolveField(keyOrCol: string): string | undefined {
  return _fieldLookup[keyOrCol]
}

// ---------------------------------------------------------------------------
// 2. Date columns  (need special formatting / comparison)
// ---------------------------------------------------------------------------

export const DATE_COLUMNS = new Set<string>([
  F.asofDate,
  F.tradeDt,
  F.startDt,
  F.maturityDt,
  F.i_maturityDt,
])

// ---------------------------------------------------------------------------
// 3. All trade-level columns (ordered for SELECT)
// ---------------------------------------------------------------------------

export const TRADE_COLUMNS = [
  F.tradeId, F.asofDate, F.tradeStatus, F.side,
  F.productType, F.productSubType, F.hms_assetClass,
  F.tradeDt, F.startDt, F.maturityDt, F.maturityIsOpen,
  F.fundingAmount, F.fundingAmountLCY, F.collateralAmount, F.collateralAmountLCY, F.cashOut,
  F.fundingMargin, F.fixedRate, F.fundingType, F.fundingCurrency, F.fundingFixingLabel, F.haircut,
  F.collateralDesc, F.collateralType, F.collatCurrency, F.i_desc, F.i_type, F.i_coupon, F.i_instrumentCcy, F.i_maturityDt,
  F.i_isinId, F.i_bbgId, F.i_ticker,
  F.counterParty, F.counterpartyParentName, F.cp_type, F.cp_ratingMoodys, F.cp_ratingSnp, F.cp_crr, F.cp_lei, F.i_countryOfRisk, F.cp_country,
  F.i_issuerName,
  F.hmsDesk, F.hmsBook, F.hmsPortfolio, F.hmsSL1, F.hmsSL2, F.hms_primaryTrader, F.hms_region, F.hms_subRegion, F.hms_tradingLocation,
  F.fxSpot, F.fxPair, F.fxPairFunding,
  F.dtm, F.age, F.tenor,
  F.accrualDaily, F.accrualProjected, F.accrualRealised,
] as const

/** Reverse lookup: DB column → F key name (for aliasing in SELECT). */
const _dbToKey: Record<string, string> = Object.fromEntries(
  Object.entries(F).filter(([key, val]) => key !== val).map(([key, val]) => [val, key]),
)

/**
 * Build a SQL SELECT expression from an array of DB column names.
 * Applies date formatting and aliases renamed columns back to F key names
 * so JSON responses use consistent property names.
 */
function buildSelectExpr(columns: readonly string[]): string {
  return columns.map((col) => {
    const alias = _dbToKey[col]
    if (DATE_COLUMNS.has(col)) {
      return `formatDateTime(${col}, '%Y-%m-%d') AS ${alias || col}`
    }
    return alias ? `${col} AS ${alias}` : col
  }).join(", ")
}

/** SQL SELECT expression with date formatting applied. */
export const TRADE_SELECT_EXPR = buildSelectExpr(TRADE_COLUMNS)

/** Slim trade columns for activity comparison new-trades list. */
export const NEW_TRADE_COLUMNS = [
  F.tradeId, F.counterParty, F.productType, F.side,
  F.fundingAmount, F.collateralAmount, F.cashOut, F.fundingMargin,
  F.hmsDesk, F.hms_region, F.tradeDt, F.maturityDt,
  F.fundingCurrency, F.collateralDesc,
] as const

/** SQL SELECT for new-trades (14 columns vs 59 in TRADE_SELECT_EXPR). */
export const NEW_TRADE_SELECT_EXPR = buildSelectExpr(NEW_TRADE_COLUMNS)

// ---------------------------------------------------------------------------
// 4. Allowed filter columns  (SQL injection allowlist)
// ---------------------------------------------------------------------------

export const ALLOWED_FILTER_COLUMNS = new Set<string>([
  F.asofDate,
  F.counterParty,
  F.productType,
  F.hmsBook,
  F.collateralDesc,
  F.collatCurrency,
  F.i_issuerName,
  F.i_countryOfRisk,
  F.collateralType,
  F.counterpartyParentName,
  F.cp_type,
  F.hmsDesk,
  F.hmsSL1,
  F.hmsSL2,
  F.hms_region,
  F.tradeDt,
  F.maturityDt,
  F.tenor,
])

// ---------------------------------------------------------------------------
// 5. KPI measure definitions
// ---------------------------------------------------------------------------

import type { KpiMeasure } from "@/components/dashboard/kpi-cards/types"

export const kpiMeasures: KpiMeasure[] = [
  { key: "cashOut",          label: "Cash Out",           field: F.cashOut,          aggregation: "sum",    formatter: "currency" },
  { key: "fundingAmount",    label: "Funding Amount",     field: F.fundingAmount,    aggregation: "sum",    formatter: "currency" },
  { key: "collateralAmount", label: "Collateral Amount",  field: F.collateralAmount, aggregation: "sum",    formatter: "currency" },
  { key: "avgSpread",        label: "Average Spread",     field: F.fundingMargin,    aggregation: "avgBy",  weightField: F.fundingAmount, formatter: "bps" },
]

export const secondaryKpiMeasures: KpiMeasure[] = [
  { key: "avgMaturity",      label: "Avg Maturity",       field: F.dtm,              aggregation: "avgBy",  weightField: F.fundingAmount, formatter: "days" },
  { key: "dailyAccrual",     label: "Daily Accrual",      field: F.accrualDaily,     aggregation: "sum",    formatter: "currency" },
  { key: "projectedAccrual", label: "Projected Accrual",  field: F.accrualProjected, aggregation: "sum",    formatter: "currency" },
  { key: "realisedAccrual",  label: "Realized Accrual",   field: F.accrualRealised,  aggregation: "sum",    formatter: "currency" },
]

export const deepDiveMeasures: KpiMeasure[] = [
  { key: "cashOut",          label: "Cash Out",           field: F.cashOut,          aggregation: "sum",           formatter: "currency" },
  { key: "fundingAmount",    label: "Funding Amount",     field: F.fundingAmount,    aggregation: "sum",           formatter: "currency" },
  { key: "collateralAmount", label: "Collateral",         field: F.collateralAmount, aggregation: "sum",           formatter: "currency" },
  { key: "avgSpread",        label: "Avg Spread",         field: F.fundingMargin,    aggregation: "avgBy",         weightField: F.fundingAmount, formatter: "bps" },
  { key: "avgMaturity",      label: "Avg Maturity",       field: F.dtm,              aggregation: "avgBy",         weightField: F.fundingAmount, formatter: "days" },
  { key: "tradeCount",       label: "Trades",             field: F.tradeId,          aggregation: "countDistinct", formatter: "count" },
  { key: "cpCount",          label: "Counterparties",     field: F.counterParty,     aggregation: "countDistinct", formatter: "count" },
]

// ---------------------------------------------------------------------------
// 6. Stats measure definitions
// ---------------------------------------------------------------------------

import type { StatMeasure } from "@/components/dashboard/stats-row/types"

export const statMeasures: StatMeasure[] = [
  { key: "trades",        label: "Trades",          field: F.tradeId,           aggregation: "count",         icon: "Copy",      color: "oklch(0.62 0.17 255)" },
  { key: "clients",       label: "Clients",         field: F.counterParty,      aggregation: "countDistinct", icon: "Users",     color: "oklch(0.55 0.20 260)" },
  { key: "assets",        label: "Assets",          field: F.collateralDesc,    aggregation: "countDistinct", icon: "Briefcase", color: "oklch(0.60 0.16 170)" },
  { key: "collateralCcy", label: "Collateral Ccy",  field: F.collatCurrency,    aggregation: "countDistinct", icon: "Coins",     color: "oklch(0.65 0.15 50)" },
  { key: "fundingCcy",    label: "Funding Ccy",     field: F.fundingCurrency,   aggregation: "countDistinct", icon: "DollarSign", color: "oklch(0.58 0.18 300)" },
  { key: "books",         label: "Books",           field: F.hmsBook,           aggregation: "countDistinct", icon: "BookOpen",  color: "oklch(0.55 0.15 230)" },
  { key: "traders",       label: "Traders",         field: F.hms_primaryTrader, aggregation: "countDistinct", icon: "UserCheck", color: "oklch(0.60 0.14 200)" },
]

// ---------------------------------------------------------------------------
// 7. Cash-out chart field options
// ---------------------------------------------------------------------------

export const CHART_FIELD_OPTIONS = [
  { value: F.cashOut,          label: "Cash Out" },
  { value: F.fundingAmount,    label: "Funding Amount" },
  { value: F.collateralAmount, label: "Collateral Amount" },
  { value: "weightedSpread",   label: "Avg Spread (bps)" },
] as const

// ---------------------------------------------------------------------------
// 8. Radial chart definitions
// ---------------------------------------------------------------------------

import type { RadialChartDef } from "@/components/dashboard/radial-charts-group/data"

export const radialCharts: RadialChartDef[] = [
  {
    key: "fundingByProduct",
    title: "Funding by Product",
    description: "Funding amount distribution",
    measure: { field: F.fundingAmount, aggregation: "sum" },
    groupBy: F.productType,
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "cashOutByCpType",
    title: "Cash Out by CP Type",
    description: "Cash out by counterparty type",
    measure: { field: F.cashOut, aggregation: "sum" },
    groupBy: F.cp_type,
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "collateralByCurrency",
    title: "Collateral by Currency",
    description: "Collateral amount by currency",
    measure: { field: F.collateralAmount, aggregation: "sum" },
    groupBy: F.collatCurrency,
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "collateralByRegion",
    title: "Collateral by Region",
    description: "Collateral amount by region",
    measure: { field: F.collateralAmount, aggregation: "sum" },
    groupBy: F.hms_region,
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
  {
    key: "wrongWayRisk",
    title: "Wrong Way Risk",
    description: "Wrong Way Risk by Country",
    measure: { field: F.fundingAmount, aggregation: "sum" },
    groupBy: F.i_countryOfRisk,
    limit: 6,
    centerLabel: "Total",
    formatter: "currency",
  },
]

// ---------------------------------------------------------------------------
// 9. Bottom-tab definitions
// ---------------------------------------------------------------------------

import type { TabDef } from "@/components/dashboard/bottom-tabs/data"

export const bottomTabs: TabDef[] = [
  { key: "location",     label: "By Trading Desk",             groupBy: F.hmsSL1,                 groupLabel: "Location",  limit: 10 },
  { key: "portfolio",    label: "By Portfolio",                 groupBy: F.hmsBook,                groupLabel: "Portfolio", limit: 10 },
  { key: "clients",      label: "Top Clients",                  groupBy: F.counterpartyParentName, groupLabel: "Client",   limit: 100 },
  { key: "wwrByCountry", label: "Wrong Way Risk by Country",    groupBy: F.i_countryOfRisk,        groupLabel: "Country",  limit: 10 },
]

// ---------------------------------------------------------------------------
// 10. Concentration dimension options
// ---------------------------------------------------------------------------

export type CounterpartyDimension = string

export const COUNTERPARTY_DIMENSION_OPTIONS: { value: CounterpartyDimension; label: string }[] = [
  { value: "counterpartyParentName", label: "Name" },
  { value: "hms_region", label: "Region" },
  { value: "i_countryOfRisk", label: "Country" },
  { value: "cp_type", label: "Type" },
]

export const COUNTERPARTY_MEASURE_FIELD = F.fundingAmount

export type CollateralDimension = string

export const COLLATERAL_DIMENSION_OPTIONS: { value: CollateralDimension; label: string }[] = [
  { value: "collateralDesc", label: "Security" },
  { value: "i_issuerName", label: "Issuer" },
  { value: "collatCurrency", label: "Currency" },
  { value: "collateralType", label: "Type" },
]

export const COLLATERAL_MEASURE_FIELD = F.collateralAmount

// ---------------------------------------------------------------------------
// 11. Deep-dive breakdown dimensions
// ---------------------------------------------------------------------------

export const DEEP_DIVE_BREAKDOWN_DIMENSIONS = [
  { groupBy: F.hmsDesk,               label: "By Desk" },
  { groupBy: F.counterpartyParentName, label: "By Client" },
  { groupBy: F.productType,            label: "By Product" },
  { groupBy: F.hms_region,             label: "By Region" },
  { groupBy: F.collateralType,         label: "By Collateral" },
  { groupBy: F.collatCurrency,         label: "By Currency" },
]

// ---------------------------------------------------------------------------
// 12. Default comparison window
// ---------------------------------------------------------------------------

export const DEFAULT_RELATIVE_DAYS = 180

// ---------------------------------------------------------------------------
// 12b. Shared validation regex for SQL identifier parameters
// ---------------------------------------------------------------------------

export const IDENTIFIER_RE = /^[a-zA-Z0-9_]+$/

// ---------------------------------------------------------------------------
// 12c. Allowed groupBy dimensions (activity-comparison, grouped-stats, etc.)
// ---------------------------------------------------------------------------

export const ALLOWED_GROUP_BY: Set<string> = new Set([
  F.hms_region,
  F.hmsSL1,
  F.hmsSL2,
  F.hmsBook,
  F.hmsDesk,
  F.productType,
  F.counterpartyParentName,
  F.cp_type,
])

// ---------------------------------------------------------------------------
// 13. Weighted field definitions  (historical / future chart routes)
// ---------------------------------------------------------------------------

export const WEIGHTED_FIELDS: Record<string, { numerator: string; weight: string }> = {
  weightedSpread: { numerator: F.fundingMargin, weight: F.fundingAmount },
}

// ---------------------------------------------------------------------------
// 14. Trade search columns  (trades route full-text search)
// ---------------------------------------------------------------------------

export const SEARCH_COLUMNS = [
  F.counterParty,
  F.collateralDesc,
  F.i_ticker,
  F.hmsDesk,
  F.productType,
  F.tradeId,
  F.i_issuerName,
  F.hms_region,
  F.i_isinId,
  F.counterpartyParentName,
] as const

// ---------------------------------------------------------------------------
// 15. Trade sortable columns  (trades route ORDER BY allowlist)
// ---------------------------------------------------------------------------

export const SORTABLE_COLUMNS: Record<string, string> = {
  [F.tradeDt]: F.tradeDt,
  [F.maturityDt]: F.maturityDt,
  [F.fundingAmount]: F.fundingAmount,
  [F.collateralAmount]: F.collateralAmount,
  [F.counterParty]: F.counterParty,
  [F.hmsDesk]: F.hmsDesk,
  [F.fundingMargin]: F.fundingMargin,
  [F.fixedRate]: F.fixedRate,
  [F.cashOut]: F.cashOut,
}

// ---------------------------------------------------------------------------
// 16. Allowed time fields  (trends route x-axis)
// ---------------------------------------------------------------------------

export const ALLOWED_TIME_FIELDS: Record<string, string> = {
  [F.tradeDt]: F.tradeDt,
  [F.startDt]: F.startDt,
  [F.maturityDt]: F.maturityDt,
}

// ---------------------------------------------------------------------------
// 17. Allowed aggregation types
// ---------------------------------------------------------------------------

export const ALLOWED_AGGREGATIONS = ["sum", "avg", "count", "countDistinct", "avgBy"] as const

export type AggregationType = (typeof ALLOWED_AGGREGATIONS)[number]

// ---------------------------------------------------------------------------
// 18. Daily summary fields  (Perspective datasource)
// ---------------------------------------------------------------------------

export const DAILY_SUMMARY_FIELDS = [F.cashOut, F.fundingAmount, F.collateralAmount] as const

// ---------------------------------------------------------------------------
// 19. Tab summary fields  (bottom tabs aggregation)
// ---------------------------------------------------------------------------

export const TAB_SUMMARY_MEASURES = {
  cashOut: F.cashOut,
  fundingAmount: F.fundingAmount,
  collateralAmount: F.collateralAmount,
  fundingMargin: F.fundingMargin,
  dtm: F.dtm,
} as const

// ---------------------------------------------------------------------------
// 20. Centralised aggregation expression builder
// ---------------------------------------------------------------------------

/**
 * Build a ClickHouse aggregation SQL expression.
 *
 * @param field       - column name to aggregate
 * @param aggregation - aggregation type (sum, avg, count, countDistinct, avgBy)
 * @param options.weightField - required when aggregation is "avgBy"
 * @param options.alias       - optional SQL alias for the expression
 */
export function buildAggExpr(
  rawField: string,
  aggregation: string,
  options?: { weightField?: string; alias?: string },
): string {
  const field = resolveField(rawField) || rawField
  const { alias } = options ?? {}
  const weightField = options?.weightField ? (resolveField(options.weightField) || options.weightField) : undefined

  let expr: string
  if (aggregation === "avgBy") {
    if (!weightField) throw new Error(`weightField required for avgBy on ${field}`)
    expr = `sum(toFloat64OrZero(toString(${field})) * toFloat64OrZero(toString(${weightField}))) / nullIf(sum(toFloat64OrZero(toString(${weightField}))), 0)`
  } else if (aggregation === "countDistinct") {
    expr = `countDistinct(${field})`
  } else if (aggregation === "count") {
    expr = `count()`
  } else if (["sum", "avg", "max", "min"].includes(aggregation)) {
    expr = `${aggregation}(toFloat64OrZero(toString(${field})))`
  } else {
    expr = `${aggregation}(${field})`
  }

  return alias ? `${expr} as ${alias}` : expr
}
