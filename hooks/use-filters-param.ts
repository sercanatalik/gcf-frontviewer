import { useStore } from "@tanstack/react-store"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"

/**
 * Returns the serialised filter string from the store, recomputing only
 * when the serialised output actually changes.  Using the selector avoids
 * the intermediate array-reference check that `useMemo` relies on and
 * guarantees React Query sees a new queryKey whenever filters change.
 */
export function useFiltersParam(): string {
  return useStore(filtersStore, (s) => serializeFilters(s.filters))
}
