import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
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

  const res = await fetch(`${basePath}/api/tables/tab-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch tab data")
  return res.json()
}

export function useBottomTabsData(tabDefs: TabDef[]) {
  const filtersParam = useFiltersParam()

  const results = useQueries({
    queries: tabDefs.map((tab) => ({
      queryKey: ["tab-summary", tab.key, filtersParam],
      queryFn: () => fetchTabData(tab, filtersParam),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const data = useMemo(() => {
    const map: Record<string, TabRow[]> = {}
    for (let i = 0; i < tabDefs.length; i++) {
      const result = results[i]
      const tab = tabDefs[i]
      if (result?.data && tab) map[tab.key] = result.data
    }
    return map
  }, [results, tabDefs])

  return { data, isLoading }
}
