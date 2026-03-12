import { useQuery } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
import type { StatMeasure, StatData } from "./types"

async function fetchStatsSummary(
  measures: StatMeasure[],
  relativeDays: number,
  filtersParam: string,
): Promise<Record<string, StatData>> {
  const params = new URLSearchParams({
    measures: JSON.stringify(
      measures.map((m) => ({
        key: m.key,
        field: m.field,
        aggregation: m.aggregation,
      })),
    ),
    relativeDays: String(relativeDays),
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/stats-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch stats data")
  return res.json()
}

export function useStatsData(measures: StatMeasure[], relativeDays: number) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["stats-summary", measures.map((m) => m.key), relativeDays, filtersParam],
    queryFn: () => fetchStatsSummary(measures, relativeDays, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
