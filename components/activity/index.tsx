"use client"

import { useState } from "react"
import { CalendarDays, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { F } from "@/lib/field-defs"
import { useActivityData } from "./use-activity-data"
import { SummaryCards } from "./summary-cards"
import { TradeFlowCards } from "./trade-flow-cards"
import { ComparisonTable } from "./comparison-table"
import { ComparisonChart } from "./comparison-chart"
import { NewTradesTable } from "./new-trades-table"
import type { DimensionOption } from "./types"

const DIMENSION_OPTIONS: DimensionOption[] = [
  { value: F.hms_region, label: "Region" },
  { value: F.hmsSL1, label: "Strategy (SL1)" },
  { value: F.hmsSL2, label: "Strategy (SL2)" },
  { value: F.hmsBook, label: "Book" },
  { value: F.hmsDesk, label: "Desk" },
  { value: F.productType, label: "Product Type" },
  { value: F.counterpartyParentName, label: "Counterparty" },
  { value: F.cp_type, label: "CP Type" },
]

const PERIOD_OPTIONS = [
  { value: "1", label: "1 Day" },
  { value: "7", label: "1 Week" },
  { value: "14", label: "2 Weeks" },
  { value: "30", label: "1 Month" },
  { value: "60", label: "2 Months" },
  { value: "90", label: "3 Months" },
  { value: "180", label: "6 Months" },
  { value: "365", label: "1 Year" },
  { value: "548", label: "18 Months" },
  { value: "730", label: "2 Years" },
]

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-32">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading activity comparison...</p>
    </div>
  )
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-32">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm text-destructive">{error.message}</p>
    </div>
  )
}

export function ActivityComparison() {
  const [groupBy, setGroupBy] = useState(F.hms_region)
  const [daysAgo, setDaysAgo] = useState(30)

  const { data, isLoading, error } = useActivityData(groupBy, daysAgo)

  const currentLabel = DIMENSION_OPTIONS.find((d) => d.value === groupBy)?.label || groupBy
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === String(daysAgo))?.label || `${daysAgo} days`

  return (
    <div className="flex flex-col gap-5">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Activity Comparison</h1>
          <p className="text-sm text-muted-foreground">
            Period-over-period analysis of trading activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              {DIMENSION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(daysAgo)} onValueChange={(v) => setDaysAgo(Number(v))}>
            <SelectTrigger size="sm">
              <CalendarDays className="mr-1 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date badges */}
      {data && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1 font-mono text-[10px]">
            <CalendarDays className="size-3" />
            Current: {data.totals.current.asOfDate || "N/A"}
          </Badge>
          <span>vs</span>
          <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
            <CalendarDays className="size-3" />
            Previous: {data.totals.previous.asOfDate || "N/A"}
          </Badge>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <span>Grouped by <strong>{currentLabel}</strong> over <strong>{periodLabel}</strong></span>
        </div>
      )}

      {isLoading && <LoadingSkeleton />}
      {error && <ErrorState error={error} />}

      {data && (
        <>
          {/* Summary KPI Cards */}
          <SummaryCards
            current={data.totals.current}
            previous={data.totals.previous}
            daysAgo={daysAgo}
          />

          {/* Trade Flow */}
          <TradeFlowCards tradeFlow={data.tradeFlow} daysAgo={daysAgo} />

          {/* Chart + Table */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ComparisonChart data={data.grouped} groupLabel={currentLabel} />
            <ComparisonTable data={data.grouped} groupLabel={currentLabel} daysAgo={daysAgo} />
          </div>

          {/* New Trades */}
          <NewTradesTable data={data.newTrades ?? []} daysAgo={daysAgo} />
        </>
      )}
    </div>
  )
}
