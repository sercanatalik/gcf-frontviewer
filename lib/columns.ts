/** Date-typed columns that need special handling (formatting, comparison). */
export const DATE_COLUMNS = new Set([
  "asofDate",
  "tradeDt",
  "startDt",
  "maturityDt",
  "instrumentMaturityDt",
])
