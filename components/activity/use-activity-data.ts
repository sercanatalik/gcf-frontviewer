"use client"

import { useQuery } from "@tanstack/react-query"
import { basePath } from "@/lib/utils"
import { useFiltersParam } from "@/hooks/use-filters-param"
import type { ActivityData } from "./types"

async function fetchActivityComparison(
  groupBy: string,
  daysAgo: number,
  filtersParam: string,
): Promise<ActivityData> {
  const params = new URLSearchParams({
    groupBy,
    daysAgo: String(daysAgo),
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/activity-comparison?${params}`)
  if (!res.ok) throw new Error("Failed to fetch activity comparison data")
  return res.json()
}

export function useActivityData(groupBy: string, daysAgo: number) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["activity-comparison", groupBy, daysAgo, filtersParam],
    queryFn: () => fetchActivityComparison(groupBy, daysAgo, filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
