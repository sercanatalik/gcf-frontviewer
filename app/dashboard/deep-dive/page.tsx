"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { DeepDiveContent } from "@/components/dashboard/deep-dive"

export default function DeepDivePage() {
  return (
    <Suspense>
      <DeepDiveInner />
    </Suspense>
  )
}

function DeepDiveInner() {
  const searchParams = useSearchParams()
  const field = searchParams.get("field")
  const value = searchParams.get("value")
  const label = searchParams.get("label") || value || ""

  if (!field || !value) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Missing field or value parameter.
      </div>
    )
  }

  return <DeepDiveContent field={field} value={value} label={label} />
}
