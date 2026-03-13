import { NextRequest, NextResponse } from "next/server"
import { getClickHouseClient } from "@/lib/clickhouse"
import { buildWhereClausesFromFilters, splitAsofDateClauses, buildLatestDateExpr } from "@/lib/filters/serialize"
import { F, IDENTIFIER_RE, ALLOWED_GROUP_BY, TRADE_SELECT_EXPR } from "@/lib/field-defs"

/**
 * Activity Comparison API
 *
 * Compares two snapshots: latest (today) vs N days ago (default 30).
 * Groups by a chosen dimension (region, hmsSL1, hmsSL2, book, etc.)
 * and returns:
 *   - fundingAmount, collateralAmount, weighted avg spread for each period
 *   - matured trade count (trades present in previous but not in current)
 *   - new trade count (trades present in current but not in previous)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupBy = searchParams.get("groupBy") || F.hms_region
  const daysAgo = Math.min(
    Math.max(Number(searchParams.get("daysAgo") || "30"), 1),
    730,
  )
  const filtersJson = searchParams.get("filters") || ""

  if (!IDENTIFIER_RE.test(groupBy) || !ALLOWED_GROUP_BY.has(groupBy as string)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  }

  try {
    const client = getClickHouseClient()

    const { clauses, params, hasAsofDate } = filtersJson
      ? buildWhereClausesFromFilters(filtersJson)
      : { clauses: [] as string[], params: {} as Record<string, unknown>, hasAsofDate: false }

    const { asofClause, filterWhere } = splitAsofDateClauses(clauses, hasAsofDate)
    const latestDateExpr = buildLatestDateExpr(asofClause, hasAsofDate)

    const prevDateCTE = `
      SELECT max(${F.asofDate}) AS d
      FROM gcf_risk_mv FINAL
      WHERE ${F.asofDate} <= (SELECT d FROM latestDate) - toIntervalDay({daysAgo:UInt32})
    `

    // ── 1. Grouped comparison by dimension ──────────────────────────
    const groupedQuery = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (${prevDateCTE}),
        current AS (
          SELECT
            ${groupBy} AS grp,
            sum(toFloat64OrZero(toString(${F.fundingAmount})))  AS totalFunding,
            sum(toFloat64OrZero(toString(${F.collateralAmount}))) AS totalCollateral,
            sum(toFloat64OrZero(toString(${F.fundingMargin})) * toFloat64OrZero(toString(${F.fundingAmount})))
              / nullIf(sum(toFloat64OrZero(toString(${F.fundingAmount}))), 0) AS avgSpread,
            countDistinct(${F.tradeId}) AS tradeCount
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
          GROUP BY ${groupBy}
        ),
        previous AS (
          SELECT
            ${groupBy} AS grp,
            sum(toFloat64OrZero(toString(${F.fundingAmount})))  AS totalFunding,
            sum(toFloat64OrZero(toString(${F.collateralAmount}))) AS totalCollateral,
            sum(toFloat64OrZero(toString(${F.fundingMargin})) * toFloat64OrZero(toString(${F.fundingAmount})))
              / nullIf(sum(toFloat64OrZero(toString(${F.fundingAmount}))), 0) AS avgSpread,
            countDistinct(${F.tradeId}) AS tradeCount
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM prevDate)${filterWhere}
          GROUP BY ${groupBy}
        )
      SELECT
        coalesce(c.grp, p.grp) AS group,
        coalesce(c.totalFunding, 0) AS currentFunding,
        coalesce(p.totalFunding, 0) AS previousFunding,
        coalesce(c.totalCollateral, 0) AS currentCollateral,
        coalesce(p.totalCollateral, 0) AS previousCollateral,
        coalesce(c.avgSpread, 0) AS currentSpread,
        coalesce(p.avgSpread, 0) AS previousSpread,
        coalesce(c.tradeCount, 0) AS currentTradeCount,
        coalesce(p.tradeCount, 0) AS previousTradeCount
      FROM current c
      FULL OUTER JOIN previous p ON c.grp = p.grp
      ORDER BY coalesce(c.totalFunding, 0) DESC
    `

    // ── 2. Matured & new trade summary ──────────────────────────────
    const tradeFlowQuery = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (${prevDateCTE}),
        currentTrades AS (
          SELECT DISTINCT ${F.tradeId}
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
        ),
        previousTrades AS (
          SELECT DISTINCT ${F.tradeId}
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM prevDate)${filterWhere}
        )
      SELECT
        (SELECT count() FROM currentTrades WHERE ${F.tradeId} NOT IN (SELECT ${F.tradeId} FROM previousTrades)) AS newTrades,
        (SELECT count() FROM previousTrades WHERE ${F.tradeId} NOT IN (SELECT ${F.tradeId} FROM currentTrades)) AS maturedTrades,
        (SELECT count() FROM currentTrades WHERE ${F.tradeId} IN (SELECT ${F.tradeId} FROM previousTrades)) AS rolledTrades,
        (SELECT count() FROM currentTrades) AS totalCurrent,
        (SELECT count() FROM previousTrades) AS totalPrevious
    `

    // ── 3. Totals for both periods ──────────────────────────────────
    const totalsQuery = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (${prevDateCTE})
      SELECT
        'current' AS period,
        formatDateTime((SELECT d FROM latestDate), '%Y-%m-%d') AS asOfDate,
        sum(toFloat64OrZero(toString(${F.fundingAmount}))) AS totalFunding,
        sum(toFloat64OrZero(toString(${F.collateralAmount}))) AS totalCollateral,
        sum(toFloat64OrZero(toString(${F.fundingMargin})) * toFloat64OrZero(toString(${F.fundingAmount})))
          / nullIf(sum(toFloat64OrZero(toString(${F.fundingAmount}))), 0) AS avgSpread,
        countDistinct(${F.tradeId}) AS tradeCount,
        countDistinct(${F.counterParty}) AS clientCount,
        countDistinct(${F.hmsBook}) AS bookCount
      FROM gcf_risk_mv FINAL
      WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
      UNION ALL
      SELECT
        'previous' AS period,
        formatDateTime((SELECT d FROM prevDate), '%Y-%m-%d') AS asOfDate,
        sum(toFloat64OrZero(toString(${F.fundingAmount}))) AS totalFunding,
        sum(toFloat64OrZero(toString(${F.collateralAmount}))) AS totalCollateral,
        sum(toFloat64OrZero(toString(${F.fundingMargin})) * toFloat64OrZero(toString(${F.fundingAmount})))
          / nullIf(sum(toFloat64OrZero(toString(${F.fundingAmount}))), 0) AS avgSpread,
        countDistinct(${F.tradeId}) AS tradeCount,
        countDistinct(${F.counterParty}) AS clientCount,
        countDistinct(${F.hmsBook}) AS bookCount
      FROM gcf_risk_mv FINAL
      WHERE ${F.asofDate} = (SELECT d FROM prevDate)${filterWhere}
    `

    // ── 4. New trades between periods (detail rows) ─────────────────
    // Use a subquery for filtering to avoid alias conflict:
    // TRADE_SELECT_EXPR aliases date columns as strings (e.g. formatDateTime(asofDate) AS asofDate)
    // which would clash with the WHERE clause comparing asofDate to a Date value.
    const newTradesQuery = `
      WITH
        latestDate AS (${latestDateExpr}),
        prevDate AS (${prevDateCTE}),
        previousIds AS (
          SELECT DISTINCT ${F.tradeId}
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM prevDate)${filterWhere}
        ),
        filtered AS (
          SELECT *
          FROM gcf_risk_mv FINAL
          WHERE ${F.asofDate} = (SELECT d FROM latestDate)${filterWhere}
            AND ${F.tradeId} NOT IN (SELECT ${F.tradeId} FROM previousIds)
        )
      SELECT ${TRADE_SELECT_EXPR}
      FROM filtered
      ORDER BY toFloat64OrZero(toString(${F.fundingAmount})) DESC
      LIMIT 500
    `

    const queryParams = { daysAgo, ...params }

    const [groupedResult, tradeFlowResult, totalsResult, newTradesResult] = await Promise.all([
      client.query({ query: groupedQuery, query_params: queryParams, format: "JSONEachRow" }),
      client.query({ query: tradeFlowQuery, query_params: queryParams, format: "JSONEachRow" }),
      client.query({ query: totalsQuery, query_params: queryParams, format: "JSONEachRow" }),
      client.query({ query: newTradesQuery, query_params: queryParams, format: "JSONEachRow" }),
    ])

    const grouped = await groupedResult.json()
    const tradeFlow = (await tradeFlowResult.json()) as Array<Record<string, unknown>>
    const totals = (await totalsResult.json()) as Array<Record<string, unknown>>
    const newTrades = await newTradesResult.json()

    const currentTotals = totals.find((r) => r.period === "current") || {}
    const previousTotals = totals.find((r) => r.period === "previous") || {}

    return NextResponse.json(
      {
        grouped,
        tradeFlow: tradeFlow[0] || {},
        totals: { current: currentTotals, previous: previousTotals },
        newTrades,
        meta: { groupBy, daysAgo },
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    )
  } catch (error) {
    console.error("Activity comparison error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
