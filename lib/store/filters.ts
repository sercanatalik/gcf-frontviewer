import { Store } from '@tanstack/react-store'

export interface Filter {
  id: string
  type: string
  operator: string
  value: string[]
  field?: string
}

export interface FiltersState {
  filters: Filter[]
  activeTable: string
  asOfDate: string | null
  chartGroupBy: string | undefined
}

const STORAGE_KEY = "gcf-filters-state"

const defaultState: FiltersState = {
  filters: [],
  activeTable: '',
  asOfDate: null,
  chartGroupBy: undefined,
}

// Always start with empty state — hydrate from localStorage after mount
export const filtersStore = new Store<FiltersState>(defaultState)

/**
 * Call once from a client component useEffect to hydrate persisted filters.
 * Deferred to avoid SSR/client hydration mismatch.
 */
export function hydrateFiltersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    // Strip the asOfDate filter so it gets re-seeded from DB on mount
    const filters = Array.isArray(parsed.filters)
      ? parsed.filters.filter((f: Filter) => f.id !== "__asOfDate__")
      : []
    if (filters.length > 0 || parsed.chartGroupBy) {
      filtersStore.setState((state) => ({
        ...state,
        filters: filters.length > 0 ? filters : state.filters,
        chartGroupBy: parsed.chartGroupBy ?? state.chartGroupBy,
      }))
    }
  } catch {
    // localStorage unavailable — ignore
  }
}

// Persist filter-relevant state on every change
filtersStore.subscribe(() => {
  if (typeof window === "undefined") return
  const { filters, asOfDate, chartGroupBy } = filtersStore.state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, asOfDate, chartGroupBy }))
  } catch {
    // localStorage full or unavailable — ignore
  }
})

export const filtersActions = {
  setFilters: (filters: Filter[]) => {
    filtersStore.setState((state) => ({
      ...state,
      filters,
    }))
  },

  addFilter: (filter: Filter) => {
    filtersStore.setState((state) => ({
      ...state,
      filters: [...state.filters, filter],
    }))
  },

  removeFilter: (filterId: string) => {
    filtersStore.setState((state) => ({
      ...state,
      filters: state.filters.filter(f => f.id !== filterId),
    }))
  },

  updateFilter: (filterId: string, updates: Partial<Filter>) => {
    filtersStore.setState((state) => ({
      ...state,
      filters: state.filters.map(f =>
        f.id === filterId ? { ...f, ...updates } : f
      ),
    }))
  },

  clearFilters: () => {
    filtersStore.setState((state) => ({
      ...state,
      filters: [],
    }))
  },

  setActiveTable: (tableName: string) => {
    filtersStore.setState((state) => ({
      ...state,
      activeTable: tableName,
    }))
  },

  setAsOfDate: (asOfDate: string | null) => {
    filtersStore.setState((state) => ({
      ...state,
      asOfDate,
    }))
  },

  setChartGroupBy: (chartGroupBy: string | undefined) => {
    filtersStore.setState((state) => ({
      ...state,
      chartGroupBy,
    }))
  },
}
