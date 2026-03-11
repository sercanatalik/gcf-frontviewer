export interface Trade {
  tradeId: string
  asofDate: string
  tradeStatus: string
  side: string

  // Product
  productType: string
  productSubType: string
  hms_assetClass: string

  // Dates
  tradeDt: string
  startDt: string
  maturityDt: string
  maturityIsOpen: number

  // Amounts
  fundingAmount: number
  fundingAmountLCY: number
  collateralAmount: number
  collateralAmountLCY: number
  financingExposure: number
  cashOut: number

  // Funding terms
  fundingMargin: number
  fixedRate: number
  fundingType: string
  fundingCurrency: string
  fundingFixingLabel: string
  haircut: number

  // Collateral
  collateralDesc: string
  collateralType: string
  collatCurrency: string
  i_desc: string
  i_type: string
  i_coupon: number
  i_instrumentCcy: string
  i_maturityDt: string

  // Identifiers
  i_isinId: string
  i_bbgId: string
  i_ticker: string
  i_tickId: string
  i_palmsCode: string

  // Instrument detail
  i_issuerLei: string
  i_outstandingAmt: number
  i_country: string
  i_region: string
  i_industrySector: string
  i_rating: string
  i_collateralQuality: string
  i_collateralType: string

  // Counterparty
  counterParty: string
  counterpartyParentName: string
  cp_type: string
  cp_ratingMoodys: string
  cp_ratingSnp: string
  cp_crr: string
  cp_lei: string
  i_countryOfRisk: string
  cp_country: string
  cp_region: string
  cp_countryIncorporation: string
  cp_countryOperation: string
  cp_treatsParent: string

  // Issuer
  i_issuerName: string

  // Trading / Book
  hmsDesk: string
  hmsBook: string
  hmsPortfolio: string
  hmsSL1: string
  hmsSL2: string
  hms_primaryTrader: string
  hms_region: string
  hms_subRegion: string
  hms_tradingLocation: string
  hms_bookCategory: string
  hms_leName: string

  // FX
  fxSpot: number
  fxPair: string
  fxPairFunding: string

  // Risk
  dtm: number
  age: number
  tenor: string
  realisedMarginCall: number
  expectedMarginCall: number

  // Accruals
  accrualDaily: number
  accrualProjected: number
  accrualRealised: number
}
