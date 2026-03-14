import { useCallback } from "react"
import { useRouter } from "next/navigation"

export function useDeepDiveNavigation(field: string) {
  const router = useRouter()
  return useCallback(
    (value: string, label?: string) => {
      const params = new URLSearchParams({
        field,
        value,
        label: label ?? value,
      })
      router.push(`/dashboard/deep-dive?${params}`)
    },
    [field, router],
  )
}
