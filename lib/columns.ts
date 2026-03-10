/** Date-typed columns that need special handling (formatting, comparison). */
export const DATE_COLUMNS = new Set([
  "asofDate",
  "tradeDt",
  "startDt",
  "maturityDt",
  "i_maturityDt",
])

/** All trade-level columns from gcf_risk_mv used across trade routes. */
export const TRADE_COLUMNS = [
  "tradeId",
  "asofDate",
  "tradeStatus",
  "side",

  "productType",
  "productSubType",
  "hms_assetClass",

  "tradeDt",
  "startDt",
  "maturityDt",
  "maturityIsOpen",

  "fundingAmount",
  "fundingAmountLCY",
  "collateralAmount",
  "collateralAmountLCY",
  "financingExposure",
  "cashOut",

  "fundingMargin",
  "fixedRate",
  "fundingType",
  "fundingCurrency",
  "fundingFixingLabel",
  "haircut",

  "collateralDesc",
  "collateralType",
  "collatCurrency",
  "i_desc",
  "i_type",
  "i_coupon",
  "i_instrumentCcy",
  "i_maturityDt",

  "i_isinId",
  "i_bbgId",
  "i_ticker",

  "counterParty",
  "counterpartyParentName",
  "cp_type",
  "cp_ratingMoodys",
  "cp_ratingSnp",
  "cp_crr",
  "cp_lei",
  "i_countryOfRisk",
  "cp_country",

  "i_issuerName",

  "hmsDesk",
  "hmsBook",
  "hmsPortfolio",
  "hmsSL1",
  "hmsSL2",
  "hms_primaryTrader",
  "hms_region",
  "hms_subRegion",
  "hms_tradingLocation",
  "hms_bookCategory",
  "hms_leName",

  "fxSpot",
  "fxPair",
  "fxPairFunding",

  "dtm",
  "age",
  "tenor",
  "realisedMarginCall",
  "expectedMarginCall",

  "accrualDaily",
  "accrualProjected",
  "accrualRealised",
] as const

/** SQL SELECT expression with date formatting applied. */
export const TRADE_SELECT_EXPR = TRADE_COLUMNS.map((col) =>
  DATE_COLUMNS.has(col)
    ? `formatDateTime(${col}, '%Y-%m-%d') AS ${col}`
    : col,
).join(", ")
