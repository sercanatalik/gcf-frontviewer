import { useQueries } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import type { TabDef } from "./data"

export interface TabRow {
  group: string
  trades: number
  cash_out: number
  funding_amount: number
  collateral_amount: number
  avg_spread: number | null
  avg_dtm: number | null
}

async function fetchTabData(
  tab: TabDef,
  filtersParam: string,
): Promise<TabRow[]> {
  const params = new URLSearchParams({
    groupBy: tab.groupBy,
    limit: String(tab.limit ?? 10),
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`/api/tables/tab-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch tab data")
  return res.json()
}

export function useBottomTabsData(tabDefs: TabDef[]) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  const results = useQueries({
    queries: tabDefs.map((tab) => ({
      queryKey: ["tab-summary", tab.key, filtersParam],
      queryFn: () => fetchTabData(tab, filtersParam),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const data: Record<string, TabRow[]> = {}
  for (let i = 0; i < tabDefs.length; i++) {
    const result = results[i]
    const tab = tabDefs[i]
    if (result?.data && tab) data[tab.key] = result.data
  }

  return { data, isLoading }
}
