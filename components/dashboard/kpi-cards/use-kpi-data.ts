import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import type { KpiMeasure, KpiStatData } from "./types"

async function fetchKpiSummary(
  measures: KpiMeasure[],
  relativeDays: number,
  filtersParam: string,
): Promise<Record<string, KpiStatData>> {
  const params = new URLSearchParams({
    measures: JSON.stringify(
      measures.map((m) => ({
        key: m.key,
        field: m.field,
        aggregation: m.aggregation,
        ...(m.weightField ? { weightField: m.weightField } : {}),
      })),
    ),
    relativeDays: String(relativeDays),
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`/api/tables/kpi-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch KPI data")
  return res.json()
}

export function useKpiData(measures: KpiMeasure[], relativeDays: number) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["kpi-summary", measures.map((m) => m.key), relativeDays, filtersParam],
    queryFn: () => fetchKpiSummary(measures, relativeDays, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
