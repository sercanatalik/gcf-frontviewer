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

export const filtersStore = new Store<FiltersState>({
  filters: [],
  activeTable: '',
  asOfDate: null,
  chartGroupBy: undefined,
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
