import { useQuery } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
import type { ConcentrationData } from "@/components/dashboard/concentration-risk/use-concentration-data"

export type { CollateralDimension } from "@/lib/field-defs"
export { COLLATERAL_DIMENSION_OPTIONS as DIMENSION_OPTIONS, COLLATERAL_MEASURE_FIELD } from "@/lib/field-defs"
import type { CollateralDimension } from "@/lib/field-defs"
import { COLLATERAL_MEASURE_FIELD } from "@/lib/field-defs"

async function fetchCollateralConcentration(
  filtersParam: string,
  dimension: CollateralDimension,
): Promise<ConcentrationData> {
  const params = new URLSearchParams({
    groupBy: dimension,
    field: COLLATERAL_MEASURE_FIELD,
    topN: "10",
  })
  if (filtersParam) params.set("filters", filtersParam)

  const res = await fetch(`${basePath}/api/tables/concentration?${params}`)
  if (!res.ok) throw new Error("Failed to fetch collateral concentration")
  return res.json()
}

export function useCollateralConcentration(dimension: CollateralDimension) {
  const filtersParam = useFiltersParam()

  return useQuery({
    queryKey: ["collateral-concentration", dimension, filtersParam],
    queryFn: () => fetchCollateralConcentration(filtersParam, dimension),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
