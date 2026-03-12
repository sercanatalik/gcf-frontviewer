import { useQuery } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
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
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["cashout-historical", fieldName, groupBy, filtersParam],
    queryFn: () => fetchData("historical", fieldName, groupBy, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useFutureData(fieldName: string, groupBy?: string) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["cashout-future", fieldName, groupBy, filtersParam],
    queryFn: () => fetchData("future", fieldName, groupBy, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
