import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import { basePath } from "@/lib/utils"

export interface TrendParams {
  field: string
  aggregation: string
  weightField?: string
  groupBy?: string
  topN?: number
}

export interface TrendResponse {
  data: Record<string, unknown>[]
  meta: {
    field: string
    aggregation: string
    groupBy: string | null
    groups?: string[]
  }
}

async function fetchTrend(
  params: TrendParams,
  filtersParam: string,
): Promise<TrendResponse> {
  const url = new URL(`${basePath}/api/tables/trends`, window.location.origin)
  url.searchParams.set("field", params.field)
  url.searchParams.set("aggregation", params.aggregation)
  if (params.weightField) url.searchParams.set("weightField", params.weightField)
  if (params.groupBy) url.searchParams.set("groupBy", params.groupBy)
  if (params.topN) url.searchParams.set("topN", String(params.topN))
  if (filtersParam) url.searchParams.set("filters", filtersParam)
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch trend data")
  return res.json()
}

export function useTrendData(params: TrendParams) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["trend", params, filtersParam],
    queryFn: () => fetchTrend(params, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
