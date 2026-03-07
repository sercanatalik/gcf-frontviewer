export interface Trade {
  tradeId: string
  asofDate: string
  tradeStatus: string
  side: string

  // Product
  productType: string
  productSubType: string
  assetClass: string

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
  collatName: string
  instrumentType: string
  coupon: number
  couponType: string
  instrumentCcy: string
  instrumentMaturityDt: string

  // Identifiers
  isinId: string
  bbgId: string
  ticker: string

  // Counterparty
  counterParty: string
  counterpartyParentName: string
  cpType: string
  cpRatingMoodys: string
  cpRatingSnp: string
  cpCrr: string
  counterpartyLei: string
  countryOfRisk: string
  domicileCountry: string

  // Issuer
  issuerName: string

  // Trading / Book
  hmsDesk: string
  hmsBook: string
  hmsPortfolio: string
  hmsSL1: string
  hmsSL2: string
  primaryTrader: string
  region: string
  subRegion: string
  tradingLocation: string
  bookCategory: string
  leName: string

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
