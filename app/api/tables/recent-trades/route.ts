import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"

const COLUMNS = [
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

const DATE_COLUMNS = new Set([
  "asofDate",
  "tradeDt",
  "startDt",
  "maturityDt",
  "instrumentMaturityDt",
])

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 200)
  const sort = searchParams.get("sort") === "maturity" ? "maturityDt ASC" : "tradeDt DESC"

  try {
    const selectExpr = COLUMNS.map((col) =>
      DATE_COLUMNS.has(col)
        ? `formatDateTime(${col}, '%Y-%m-%d') AS ${col}`
        : col,
    ).join(", ")

    const query = `
      SELECT ${selectExpr}
      FROM gcf_risk_mv
      ORDER BY ${sort}
      LIMIT ${limit}
    `

    const client = getClickHouseClient()
    const result = await client.query({ query, format: "JSONEachRow" })
    const rows = await result.json()

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("Error fetching recent trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
