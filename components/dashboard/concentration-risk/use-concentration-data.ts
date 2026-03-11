import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import { basePath } from "@/lib/utils"

export interface ConcentrationItem {
  name: string
  exposure: number
  share: number
}

export interface ConcentrationData {
  total: number
  hhi: number
  topNShare: number
  groupCount: number
  topN: number
  items: ConcentrationItem[]
}

async function fetchConcentration(filtersParam: string): Promise<ConcentrationData> {
  const params = new URLSearchParams({
    groupBy: "counterpartyParentName",
    field: "fundingAmount",
    topN: "10",
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/concentration?${params}`)
  if (!res.ok) throw new Error("Failed to fetch concentration data")
  return res.json()
}

export function useConcentrationData() {
  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  return useQuery({
    queryKey: ["concentration", filtersParam],
    queryFn: () => fetchConcentration(filtersParam),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
