import { useQuery } from "@tanstack/react-query"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"
import type { ConcentrationData } from "@/components/dashboard/concentration-risk/use-concentration-data"

export type CollateralDimension = "collateralDesc" | "i_issuerName" | "collatCurrency" | "collateralType"

export const DIMENSION_OPTIONS: { value: CollateralDimension; label: string }[] = [
  { value: "collateralDesc", label: "Security" },
  { value: "i_issuerName", label: "Issuer" },
  { value: "collatCurrency", label: "Currency" },
  { value: "collateralType", label: "Type" },
]

async function fetchCollateralConcentration(
  filtersParam: string,
  dimension: CollateralDimension,
): Promise<ConcentrationData> {
  const params = new URLSearchParams({
    groupBy: dimension,
    field: "collateralAmount",
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
