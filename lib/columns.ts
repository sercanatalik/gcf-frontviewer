/** Date-typed columns that need special handling (formatting, comparison). */
export const DATE_COLUMNS = new Set([
  "asofDate",
  "tradeDt",
  "startDt",
  "maturityDt",
  "instrumentMaturityDt",
])

/** All trade-level columns from gcf_risk_mv used across trade routes. */
export const TRADE_COLUMNS = [
  "tradeId",
  "asofDate",
  "tradeStatus",
  "side",

  "productType",
  "productSubType",
  "assetClass",

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
  "collatName",
  "instrumentType",
  "coupon",
  "couponType",
  "instrumentCcy",
  "instrumentMaturityDt",

  "isinId",
  "bbgId",
  "ticker",

  "counterParty",
  "counterpartyParentName",
  "cpType",
  "cpRatingMoodys",
  "cpRatingSnp",
  "cpCrr",
  "counterpartyLei",
  "countryOfRisk",
  "domicileCountry",

  "issuerName",

  "hmsDesk",
  "hmsBook",
  "hmsPortfolio",
  "hmsSL1",
  "hmsSL2",
  "primaryTrader",
  "region",
  "subRegion",
  "tradingLocation",
  "bookCategory",
  "leName",

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
