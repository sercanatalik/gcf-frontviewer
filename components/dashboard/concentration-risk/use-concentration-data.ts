import { useQuery } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
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

export type CounterpartyDimension = "counterpartyParentName" | "hms_region" | "i_countryOfRisk" | "cp_type"

export const COUNTERPARTY_DIMENSION_OPTIONS: { value: CounterpartyDimension; label: string }[] = [
  { value: "counterpartyParentName", label: "Name" },
  { value: "hms_region", label: "Region" },
  { value: "i_countryOfRisk", label: "Country" },
  { value: "cp_type", label: "Type" },
]

async function fetchConcentration(
  filtersParam: string,
  dimension: CounterpartyDimension,
): Promise<ConcentrationData> {
  const params = new URLSearchParams({
    groupBy: dimension,
    field: "fundingAmount",
    topN: "10",
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/concentration?${params}`)
  if (!res.ok) throw new Error("Failed to fetch concentration data")
  return res.json()
}

export function useConcentrationData(dimension: CounterpartyDimension) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["concentration", dimension, filtersParam],
    queryFn: () => fetchConcentration(filtersParam, dimension),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
