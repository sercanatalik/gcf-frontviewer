export interface Trade {
  trade_id: number
  as_of_date: string
  book_name: string
  trade_type: string
  counterparty_name: string
  start_dt: string
  maturity_dt: string
  trade_dt: string
  funding_amount: number
  collateral_amount: number
  collateral_desc: string
  collateral_type: string
  funding_spread: number
  asset_class: string
  desk: string
  trader_name: string
  book_region: string
  region_code: string
  city: string
  counterparty_type: string
  counterparty_region: string
  country: string
  rating: string
}
