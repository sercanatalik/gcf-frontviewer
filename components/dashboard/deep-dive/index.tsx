"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Banknote,
  BarChart3,
  Clock,
  Hash,
  Percent,
  Users,
  Building2,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, basePath } from "@/lib/utils"
import type { KpiMeasure, KpiStatData } from "@/components/dashboard/kpi-cards/types"
import { formatKpiValue, formatDelta } from "@/components/dashboard/kpi-cards/utils"
import { HistoricalChart } from "@/components/dashboard/cash-out-chart/historical-chart"
import { FutureChart } from "@/components/dashboard/cash-out-chart/future-chart"
import { ChartSkeleton } from "@/components/dashboard/cash-out-chart/chart-skeleton"
import { filtersStore, filtersActions } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"

const DEEP_DIVE_MEASURES: KpiMeasure[] = [
  { key: "cashOut", label: "Cash Out", field: "cashOut", aggregation: "sum", formatter: "currency" },
  { key: "fundingAmount", label: "Funding Amount", field: "fundingAmount", aggregation: "sum", formatter: "currency" },
  { key: "collateralAmount", label: "Collateral", field: "collateralAmount", aggregation: "sum", formatter: "currency" },
  { key: "avgSpread", label: "Avg Spread", field: "fundingMargin", aggregation: "avgBy", weightField: "fundingAmount", formatter: "bps" },
  { key: "avgMaturity", label: "Avg Maturity", field: "dtm", aggregation: "avgBy", weightField: "fundingAmount", formatter: "days" },
  { key: "tradeCount", label: "Trades", field: "tradeId", aggregation: "countDistinct", formatter: "count" },
  { key: "cpCount", label: "Counterparties", field: "counterParty", aggregation: "countDistinct", formatter: "count" },
]

const RELATIVE_DAYS = 180

interface DeepDiveContentProps {
  field: string
  value: string
  label: string
}

async function fetchKpiSummary(
  measures: KpiMeasure[],
  filtersParam: string,
): Promise<Record<string, KpiStatData>> {
  const params = new URLSearchParams({
    measures: JSON.stringify(
      measures.map((m) => ({
        key: m.key,
        field: m.field,
        aggregation: m.aggregation,
        ...(m.weightField ? { weightField: m.weightField } : {}),
      })),
    ),
    relativeDays: String(RELATIVE_DAYS),
  })
  if (filtersParam) params.set("filters", filtersParam)
  const res = await fetch(`${basePath}/api/tables/kpi-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch KPI data")
  return res.json()
}

interface SubBreakdown {
  group: string
  trades: number
  cash_out: number
  funding_amount: number
  collateral_amount: number
  avg_spread: number | null
  avg_dtm: number | null
}

async function fetchSubBreakdown(
  groupBy: string,
  filtersParam: string,
): Promise<SubBreakdown[]> {
  const params = new URLSearchParams({
    groupBy,
    limit: "10",
  })
  if (filtersParam) params.set("filters", filtersParam)
  const res = await fetch(`${basePath}/api/tables/tab-summary?${params}`)
  if (!res.ok) throw new Error("Failed to fetch breakdown")
  return res.json()
}

function buildFilterParam(field: string, value: string, existingFilters: string): string {
  const deepDiveFilter = [{ field, operator: "is", value: [value] }]
  if (!existingFilters) return JSON.stringify(deepDiveFilter)
  try {
    const existing = JSON.parse(existingFilters) as unknown[]
    return JSON.stringify([...existing, ...deepDiveFilter])
  } catch {
    return JSON.stringify(deepDiveFilter)
  }
}

export function DeepDiveContent({ field, value, label }: DeepDiveContentProps) {
  const router = useRouter()

  const baseFilters = React.useMemo(
    () => serializeFilters(filtersStore.state.filters),
    [],
  )
  const filtersParam = React.useMemo(
    () => buildFilterParam(field, value, baseFilters),
    [field, value, baseFilters],
  )

  // Inject the deep-dive filter into the store so child chart components pick it up
  React.useEffect(() => {
    const id = `__deepdive_${field}`
    filtersActions.addFilter({
      id,
      type: "select",
      operator: "is",
      value: [value],
      field,
    })
    return () => {
      filtersActions.removeFilter(id)
    }
  }, [field, value])

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["deep-dive-kpi", field, value, baseFilters],
    queryFn: () => fetchKpiSummary(DEEP_DIVE_MEASURES, filtersParam),
    staleTime: 5 * 60 * 1000,
  })

  // Sub-breakdowns: pick dimensions that aren't the current one
  const breakdownDimensions = React.useMemo(() => {
    const dims = [
      { groupBy: "hmsDesk", label: "By Desk", icon: Building2 },
      { groupBy: "counterpartyParentName", label: "By Client", icon: Users },
      { groupBy: "productType", label: "By Product", icon: BarChart3 },
      { groupBy: "hms_region", label: "By Region", icon: Globe },
      { groupBy: "collateralType", label: "By Collateral", icon: Banknote },
      { groupBy: "collatCurrency", label: "By Currency", icon: Banknote },
    ]
    return dims.filter((d) => d.groupBy !== field).slice(0, 4)
  }, [field])

  const breakdownQueries = useQuery({
    queryKey: ["deep-dive-breakdown", field, value, breakdownDimensions.map((d) => d.groupBy), baseFilters],
    queryFn: async () => {
      const results: Record<string, SubBreakdown[]> = {}
      await Promise.all(
        breakdownDimensions.map(async (dim) => {
          results[dim.groupBy] = await fetchSubBreakdown(dim.groupBy, filtersParam)
        }),
      )
      return results
    },
    staleTime: 5 * 60 * 1000,
  })

  const primaryKpis = DEEP_DIVE_MEASURES.slice(0, 4)
  const secondaryKpis = DEEP_DIVE_MEASURES.slice(4)

  return (
    <div className="flex min-h-svh flex-col gap-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
            <Badge variant="secondary" className="text-xs">{field}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Deep dive analysis — filtered to <span className="font-medium text-foreground">{value}</span> compared to {RELATIVE_DAYS} days prior
          </p>
        </div>
      </div>

      {/* Executive Summary KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {primaryKpis.map((measure) => {
          const d = kpiData?.[measure.key]
          return (
            <SummaryCard
              key={measure.key}
              measure={measure}
              data={d}
              isLoading={kpiLoading}
            />
          )
        })}
      </div>

      {/* Secondary metrics strip */}
      <div className="grid grid-cols-3 gap-2">
        {secondaryKpis.map((measure) => {
          const d = kpiData?.[measure.key]
          return (
            <div
              key={measure.key}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
            >
              <span className="text-xs text-muted-foreground">{measure.label}</span>
              {kpiLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : d ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatKpiValue(d.current, measure.formatter)}
                  </span>
                  <TrendBadge change={d.changePercent} />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Historical Cash Out</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoricalChart fieldName="cashOut" groupBy={undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Future Maturity Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <FutureChart fieldName="cashOut" groupBy={undefined} />
          </CardContent>
        </Card>
      </div>

      {/* Sub-breakdowns */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {breakdownDimensions.map((dim) => {
          const rows = breakdownQueries.data?.[dim.groupBy] ?? []
          const Icon = dim.icon
          return (
            <Card key={dim.groupBy}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="size-3.5" />
                  {dim.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breakdownQueries.isLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
                ) : (
                  <BreakdownList rows={rows} />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function SummaryCard({
  measure,
  data,
  isLoading,
}: {
  measure: KpiMeasure
  data?: KpiStatData
  isLoading: boolean
}) {
  return (
    <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card">
      <CardHeader className="pb-1">
        <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {measure.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : data ? (
          <>
            <p className="text-2xl font-bold tabular-nums">
              {formatKpiValue(data.current, measure.formatter)}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <TrendBadge change={data.changePercent} />
              <span className="text-xs text-muted-foreground">
                vs {RELATIVE_DAYS}d ago
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Previous: {formatKpiValue(data.previous, measure.formatter)}</span>
              <span className={cn(
                "font-medium",
                data.change >= 0 ? "text-emerald-500" : "text-red-400",
              )}>
                {data.change >= 0 ? "+" : ""}{formatKpiValue(data.change, measure.formatter)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-lg text-muted-foreground">—</p>
        )}
      </CardContent>
    </Card>
  )
}

function TrendBadge({ change }: { change: number }) {
  const isUp = change >= 0
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
      isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400",
    )}>
      {isUp ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
      {formatDelta(change)}
    </span>
  )
}

function formatCurrency(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function BreakdownList({ rows }: { rows: SubBreakdown[] }) {
  const maxCashOut = Math.max(...rows.map((r) => Math.abs(r.cash_out)), 1)

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => {
        const pct = (Math.abs(row.cash_out) / maxCashOut) * 100
        return (
          <div
            key={row.group}
            className="group relative flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
          >
            {/* Background bar */}
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-chart-3/8 transition-all"
              style={{ width: `${pct}%` }}
            />
            <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-medium">{row.group}</span>
              <Badge variant="secondary" className="shrink-0 text-[9px] tabular-nums">
                {row.trades}
              </Badge>
            </div>
            <div className="relative z-10 flex items-center gap-3 text-xs tabular-nums">
              <span className="font-semibold">{formatCurrency(row.cash_out)}</span>
              {row.avg_spread != null && (
                <span className="text-muted-foreground">{row.avg_spread.toFixed(1)}bp</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
