import { useQueries } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
import type { RadialChartDef } from "./data"

export interface GroupedDataPoint {
  group: string
  value: number
}

async function fetchGroupedData(
  chart: RadialChartDef,
  filtersParam: string,
): Promise<GroupedDataPoint[]> {
  const params = new URLSearchParams({
    field: chart.measure.field,
    aggregation: chart.measure.aggregation,
    groupBy: chart.groupBy,
    limit: String(chart.limit ?? 8),
  })
  if (chart.measure.weightField) params.set("weightField", chart.measure.weightField)
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/grouped-stats?${params}`)
  if (!res.ok) throw new Error("Failed to fetch grouped data")
  return res.json()
}

export function useRadialData(charts: RadialChartDef[]) {
  const filtersParam = useFiltersParam()

  const results = useQueries({
    queries: charts.map((chart) => ({
      queryKey: ["grouped-stats", chart.key, filtersParam],
      queryFn: () => fetchGroupedData(chart, filtersParam),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const data: Record<string, GroupedDataPoint[]> = {}
  for (let i = 0; i < charts.length; i++) {
    const result = results[i]
    const chart = charts[i]
    if (result?.data && chart) data[chart.key] = result.data
  }

  return { data, isLoading }
}
