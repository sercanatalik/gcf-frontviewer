/**
 * Shared utilities for API route handlers.
 * Reduces boilerplate across all /api/tables/* routes.
 */

import { NextResponse } from "next/server"
import { buildWhereClausesFromFilters } from "@/lib/filters/serialize"
import { F, resolveField, IDENTIFIER_RE } from "@/lib/field-defs"

// ---------------------------------------------------------------------------
// 1. Filter parsing
// ---------------------------------------------------------------------------

export interface ParsedFilters {
  clauses: string[]
  params: Record<string, unknown>
  hasAsofDate: boolean
}

const EMPTY_FILTERS: ParsedFilters = { clauses: [], params: {}, hasAsofDate: false }

/**
 * Parse serialised filter JSON and inject a default asofDate clause if needed.
 * This is the most common boilerplate across routes.
 */
export function parseFilters(
  filtersJson: string,
  opts?: { skipDefaultAsof?: boolean; tablePrefix?: string },
): ParsedFilters {
  const { clauses, params, hasAsofDate } = filtersJson
    ? buildWhereClausesFromFilters(filtersJson)
    : { ...EMPTY_FILTERS, clauses: [] as string[], params: {} as Record<string, unknown> }

  if (!opts?.skipDefaultAsof && !hasAsofDate) {
    const prefix = opts?.tablePrefix ? `${opts.tablePrefix}.` : ""
    clauses.push(`${prefix}${F.asofDate} = (SELECT max(${F.asofDate}) FROM gcf_risk_mv FINAL)`)
  }

  return { clauses, params, hasAsofDate }
}

/**
 * Join filter clauses into a WHERE string.
 */
export function whereString(clauses: string[]): string {
  return clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : ""
}

// ---------------------------------------------------------------------------
// 2. Parameter resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a URL search param through the field lookup, with a required fallback.
 */
export function resolveParam(params: URLSearchParams, key: string, fallback: string): string {
  return resolveField(params.get(key) || "") || fallback
}

/**
 * Resolve an optional URL search param through the field lookup.
 * Returns undefined if the param is absent.
 */
export function resolveOptionalParam(params: URLSearchParams, key: string): string | undefined {
  const raw = params.get(key)
  return raw ? resolveField(raw) || raw : undefined
}

/**
 * Validate that a string is a safe SQL identifier.
 */
export function validateIdentifier(value: string, label: string): NextResponse | null {
  if (!IDENTIFIER_RE.test(value)) {
    return NextResponse.json({ error: `Invalid ${label}` }, { status: 400 })
  }
  return null
}

// ---------------------------------------------------------------------------
// 3. Response helpers
// ---------------------------------------------------------------------------

const CACHE_HEADERS_60 = { "Cache-Control": "public, max-age=60, s-maxage=60" }
const CACHE_HEADERS_120 = { "Cache-Control": "public, max-age=120, s-maxage=120" }
const CACHE_HEADERS_300 = { "Cache-Control": "public, max-age=300, s-maxage=300" }

/**
 * Return a JSON response with cache headers.
 * @param data - response body
 * @param maxAge - cache duration in seconds (default 60)
 */
export function cacheJson(data: unknown, maxAge: number = 60): NextResponse {
  const headers = maxAge === 300 ? CACHE_HEADERS_300 : maxAge === 120 ? CACHE_HEADERS_120 : CACHE_HEADERS_60
  return NextResponse.json(data, { headers })
}

/**
 * Return a 500 error response with logging.
 */
export function errorJson(label: string, error: unknown): NextResponse {
  console.error(`${label}:`, error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

// ---------------------------------------------------------------------------
// 4. Shared asofDate extraction (used by historical + future routes)
// ---------------------------------------------------------------------------

/**
 * Strip asofDate entries from serialised filters and return the date value separately.
 * Used when a route needs to treat asofDate differently (e.g. as upper bound).
 */
export function extractAsofDate(filtersJson: string): { cleaned: string; asofDate: string | null } {
  if (!filtersJson) return { cleaned: "", asofDate: null }
  try {
    const parsed = JSON.parse(filtersJson) as Array<{ field: string; operator: string; value: string[] }>
    const asofEntry = parsed.find((f) => f.field === F.asofDate)
    const asofDate = asofEntry?.value?.[0] ?? null
    const rest = parsed.filter((f) => f.field !== F.asofDate)
    return { cleaned: rest.length > 0 ? JSON.stringify(rest) : "", asofDate }
  } catch {
    return { cleaned: filtersJson, asofDate: null }
  }
}
