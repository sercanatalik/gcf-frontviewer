import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
import type { Trade } from "@/components/dashboard/recent-trades/types"

export interface TradesParams {
  limit: number
  offset: number
  search: string
  sortBy: string
  sortDir: "asc" | "desc"
  side: string
}

interface TradesResponse {
  rows: Trade[]
  total: number
  limit: number
  offset: number
}

async function fetchTrades(
  params: TradesParams,
  filtersParam: string,
): Promise<TradesResponse> {
  const url = new URL(`${basePath}/api/tables/trades`, window.location.origin)
  url.searchParams.set("limit", String(params.limit))
  url.searchParams.set("offset", String(params.offset))
  if (params.search) url.searchParams.set("search", params.search)
  url.searchParams.set("sortBy", params.sortBy)
  url.searchParams.set("sortDir", params.sortDir)
  if (params.side) url.searchParams.set("side", params.side)
  if (filtersParam) url.searchParams.set("filters", filtersParam)
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch trades")
  return res.json()
}

export function useTrades(params: TradesParams) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["trades", params, filtersParam],
    queryFn: () => fetchTrades(params, filtersParam),
    placeholderData: keepPreviousData,
  })
}
