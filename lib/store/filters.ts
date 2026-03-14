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

function loadPersistedState(): Partial<FiltersState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    // Strip the asOfDate filter so it gets re-seeded from DB on mount
    const filters = Array.isArray(parsed.filters)
      ? parsed.filters.filter((f: Filter) => f.id !== "__asOfDate__")
      : []
    return {
      filters,
      asOfDate: null,
      chartGroupBy: parsed.chartGroupBy ?? undefined,
    }
  } catch {
    return {}
  }
}

const defaultState: FiltersState = {
  filters: [],
  activeTable: '',
  asOfDate: null,
  chartGroupBy: undefined,
}

const persisted = loadPersistedState()

export const filtersStore = new Store<FiltersState>({
  ...defaultState,
  ...persisted,
})

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
