import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import type { RadialChartDef } from "./data"

export interface RadialDataPoint {
  primary: number
  secondary: number
}

async function fetchRadialData(
  charts: RadialChartDef[],
  filtersParam: string,
): Promise<Record<string, RadialDataPoint>> {
  const measures = charts.flatMap((c) => [
    {
      key: c.measures.primary.key,
      field: c.measures.primary.field,
      aggregation: c.measures.primary.aggregation,
      ...(c.measures.primary.weightField ? { weightField: c.measures.primary.weightField } : {}),
    },
    {
      key: c.measures.secondary.key,
      field: c.measures.secondary.field,
      aggregation: c.measures.secondary.aggregation,
      ...(c.measures.secondary.weightField ? { weightField: c.measures.secondary.weightField } : {}),
    },
  ])

  const params = new URLSearchParams({
    measures: JSON.stringify(measures),
    relativeDays: "180",
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`/api/tables/kpi-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch radial chart data")
  const raw: Record<string, { current: number }> = await res.json()

  const result: Record<string, RadialDataPoint> = {}
  for (const chart of charts) {
    result[chart.key] = {
      primary: Math.abs(raw[chart.measures.primary.key]?.current ?? 0),
      secondary: Math.abs(raw[chart.measures.secondary.key]?.current ?? 0),
    }
  }
  return result
}

export function useRadialData(charts: RadialChartDef[]) {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["radial-charts", charts.map((c) => c.key), filtersParam],
    queryFn: () => fetchRadialData(charts, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
