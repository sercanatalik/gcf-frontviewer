"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { FIELD_OPTIONS } from "./utils"
import { filterTypes } from "@/components/dashboard/filters/filter-config"

const GROUP_BY_OPTIONS = [
  { value: "", label: "None" },
  ...Object.entries(filterTypes)
    .filter(([, col]) => !["tradeDt", "maturityDt", "asOfDate"].includes(col))
    .map(([key, col]) => ({ value: col, label: key })),
]

interface ChartSettingsProps {
  fieldName: string
  groupBy: string | undefined
  onFieldChange: (field: string) => void
  onGroupByChange: (groupBy: string | undefined) => void
}

export function ChartSettings({
  fieldName,
  groupBy,
  onFieldChange,
  onGroupByChange,
}: ChartSettingsProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  const fieldLabel = FIELD_OPTIONS.find((f) => f.value === fieldName)?.label ?? fieldName
  const groupByLabel = GROUP_BY_OPTIONS.find((o) => o.value === (groupBy || ""))?.label ?? "None"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="font-medium">{fieldLabel}</span>
        {groupBy && (
          <>
            <span className="text-border">|</span>
            <span>{groupByLabel}</span>
          </>
        )}
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-20 w-60 rounded-xl border border-border/60 bg-card p-4 shadow-xl"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Metric
                </label>
                <div className="grid gap-1">
                  {FIELD_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => onFieldChange(o.value)}
                      className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                        fieldName === o.value
                          ? "bg-chart-3/10 font-medium text-chart-3"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Group By
                </label>
                <select
                  value={groupBy || ""}
                  onChange={(e) => onGroupByChange(e.target.value || undefined)}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-chart-3/50"
                >
                  {GROUP_BY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
