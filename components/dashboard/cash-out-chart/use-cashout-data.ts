import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import { basePath } from "@/lib/utils"

interface CashoutResponse {
  data: Record<string, unknown>[]
  meta: {
    fieldName: string
    groupBy: string | null
    recordCount: number
  }
}

async function fetchData(
  endpoint: "historical" | "future",
  fieldName: string,
  groupBy: string | undefined,
  filtersParam: string,
): Promise<CashoutResponse> {
  const params = new URLSearchParams({ fieldName })
  if (groupBy) params.set("groupBy", groupBy)
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/${endpoint}?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint} data`)
  return res.json()
}

export function useHistoricalData(fieldName: string, groupBy?: string) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["cashout-historical", fieldName, groupBy, filtersParam],
    queryFn: () => fetchData("historical", fieldName, groupBy, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useFutureData(fieldName: string, groupBy?: string) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["cashout-future", fieldName, groupBy, filtersParam],
    queryFn: () => fetchData("future", fieldName, groupBy, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
