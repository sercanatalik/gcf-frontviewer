import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { DATE_COLUMNS } from "@/lib/columns"

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

const SELECT_EXPR = COLUMNS.map((col) =>
  DATE_COLUMNS.has(col)
    ? `formatDateTime(${col}, '%Y-%m-%d') AS ${col}`
    : col,
).join(", ")

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 200)
  const sortMode = searchParams.get("sort") === "maturity" ? "maturity" : "recent"
  const sort = sortMode === "maturity" ? "maturityDt ASC" : "tradeDt DESC"
  const relativeDt = Math.min(Math.max(Number(searchParams.get("relativeDt") || "30"), 1), 365)
  const filtersJson = searchParams.get("filters") || ""

  try {

    // Build WHERE from filters
    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    // Always scope to an asofDate — fall back to the latest available
    if (!hasAsofDate) {
      clauses.push("gcf_risk_mv.asofDate = (SELECT max(asofDate) FROM gcf_risk_mv)")
    }

    // Date window: for maturity mode, only future maturities within N days
    if (sortMode === "maturity") {
      clauses.push("gcf_risk_mv.maturityDt >= gcf_risk_mv.asofDate")
      clauses.push(`gcf_risk_mv.maturityDt <= gcf_risk_mv.asofDate + toIntervalDay(${relativeDt})`)
    }

    const whereStr = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""

    const query = `
      SELECT ${SELECT_EXPR}
      FROM gcf_risk_mv
      ${whereStr}
      ORDER BY ${sort}
      LIMIT ${limit}
    `

    const client = getClickHouseClient()
    const result = await client.query({
      query,
      query_params: params,
      format: "JSONEachRow",
    })
    const rows = await result.json()

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    })
  } catch (error) {
    console.error("Error fetching recent trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
