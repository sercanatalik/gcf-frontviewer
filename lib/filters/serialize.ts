import type { Filter } from "@/lib/store/filters"
import { filterOperators } from "@/components/dashboard/filters/filter-config"

/**
 * Serialise active filters into a compact JSON string for query params.
 * Only includes filters that have at least one value.
 */
export function serializeFilters(filters: Filter[]): string {
  const active = filters
    .filter((f) => f.value.length > 0)
    .map((f) => ({
      field: f.field || f.type,
      operator: f.operator,
      value: f.value,
    }))
  if (active.length === 0) return ""
  return JSON.stringify(active)
}

export interface SerializedFilter {
  field: string
  operator: string
  value: string[]
}

/** Allowlist of columns that can be filtered. */
const ALLOWED_COLUMNS = new Set([
  "asofDate",
  "counterParty",
  "productType",
  "hmsBook",
  "collateralDesc",
  "collatCurrency",
  "i_issuerName",
  "counterpartyParentName",
  "cp_type",
  "hmsDesk",
  "hmsSL1",
  "hmsSL2",
  "tradeDt",
  "maturityDt",
  "tenor",
])

import { DATE_COLUMNS } from "@/lib/columns"

/** Date-relative value resolver (e.g. "Today" → '2026-03-07') */
function resolveDateValue(val: string): string {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  switch (val) {
    case "Today": return fmt(now)
    case "Yesterday": {
      const d = new Date(now); d.setDate(d.getDate() - 1); return fmt(d)
    }
    case "This Week": {
      const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return fmt(d)
    }
    case "Last Week": {
      const d = new Date(now); d.setDate(d.getDate() - d.getDay() - 7); return fmt(d)
    }
    case "This Month": return fmt(new Date(now.getFullYear(), now.getMonth(), 1))
    case "Last Month": return fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    case "This Quarter": {
      const q = Math.floor(now.getMonth() / 3) * 3
      return fmt(new Date(now.getFullYear(), q, 1))
    }
    case "Last Quarter": {
      const q = Math.floor(now.getMonth() / 3) * 3 - 3
      return fmt(new Date(now.getFullYear(), q, 1))
    }
    case "This Year": return fmt(new Date(now.getFullYear(), 0, 1))
    case "Last Year": return fmt(new Date(now.getFullYear() - 1, 0, 1))
    default: return val
  }
}

/**
 * Parse serialised filters and build parameterised ClickHouse WHERE clauses.
 * Returns { clauses: string[], params: Record<string,unknown> }.
 * All values are parameterised to prevent SQL injection.
 */
export function buildWhereClausesFromFilters(filtersJson: string): {
  clauses: string[]
  params: Record<string, unknown>
  hasAsofDate: boolean
} {
  const clauses: string[] = []
  const params: Record<string, unknown> = {}
  let hasAsofDate = false

  let parsed: SerializedFilter[]
  try {
    parsed = JSON.parse(filtersJson)
  } catch {
    return { clauses, params, hasAsofDate }
  }

  if (!Array.isArray(parsed)) return { clauses, params, hasAsofDate }

  parsed.forEach((f, idx) => {
    if (!ALLOWED_COLUMNS.has(f.field)) return
    if (!f.value || f.value.length === 0) return

    const sqlOp = filterOperators[f.operator]
    if (!sqlOp) return

    const col = f.field
    if (col === "asofDate") hasAsofDate = true
    const isDate = DATE_COLUMNS.has(col)
    const paramKey = `p${idx}`

    if (sqlOp === "IN") {
      // is any of
      const values = isDate ? f.value.map(resolveDateValue) : f.value
      params[paramKey] = values
      clauses.push(`${col} IN {${paramKey}:Array(String)}`)
    } else if (sqlOp === "ILIKE") {
      // include — OR across values
      const sub = f.value.map((v, vi) => {
        const pk = `${paramKey}_${vi}`
        params[pk] = `%${v}%`
        return `${col} ILIKE {${pk}:String}`
      })
      clauses.push(`(${sub.join(" OR ")})`)
    } else if (sqlOp === "NOT ILIKE") {
      // do not include — AND across values
      const sub = f.value.map((v, vi) => {
        const pk = `${paramKey}_${vi}`
        params[pk] = `%${v}%`
        return `${col} NOT ILIKE {${pk}:String}`
      })
      clauses.push(`(${sub.join(" AND ")})`)
    } else {
      // =, !=, <, >, <=, >=
      // For multi-value with = operator, use IN
      if (f.value.length > 1 && sqlOp === "=") {
        const values = isDate ? f.value.map(resolveDateValue) : f.value
        params[paramKey] = values
        clauses.push(`${col} IN {${paramKey}:Array(String)}`)
      } else if (f.value.length > 1 && sqlOp === "!=") {
        const values = isDate ? f.value.map(resolveDateValue) : f.value
        params[paramKey] = values
        clauses.push(`${col} NOT IN {${paramKey}:Array(String)}`)
      } else {
        const firstVal = f.value[0]!
        const resolvedVal = isDate ? resolveDateValue(firstVal) : firstVal
        params[paramKey] = resolvedVal
        clauses.push(`${col} ${sqlOp} {${paramKey}:String}`)
      }
    }
  })

  return { clauses, params, hasAsofDate }
}
