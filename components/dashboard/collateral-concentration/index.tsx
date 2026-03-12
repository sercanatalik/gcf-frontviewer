"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, Info, Layers, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useCollateralConcentration,
  DIMENSION_OPTIONS,
  type CollateralDimension,
} from "./use-collateral-concentration"

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function hhiLevel(hhi: number): { label: string; textColor: string } {
  if (hhi < 0.15) return { label: "Low", textColor: "text-emerald-500" }
  if (hhi < 0.25) return { label: "Moderate", textColor: "text-amber-500" }
  return { label: "High", textColor: "text-red-500" }
}

const BAR_COLORS = [
  "oklch(0.75 0.14 165)",
  "oklch(0.70 0.13 160)",
  "oklch(0.65 0.12 155)",
  "oklch(0.60 0.11 150)",
  "oklch(0.55 0.10 145)",
  "oklch(0.50 0.09 140)",
  "oklch(0.45 0.08 135)",
  "oklch(0.40 0.07 130)",
  "oklch(0.35 0.06 125)",
  "oklch(0.30 0.05 120)",
]

const chartConfig: ChartConfig = {
  exposure: { label: "Collateral" },
}

export function CollateralConcentration() {
  const [dimension, setDimension] = useState<CollateralDimension>("collateralDesc")
  const { data, isLoading, error } = useCollateralConcentration(dimension)

  const level = data ? hhiLevel(data.hhi) : null
  const dimensionLabel = DIMENSION_OPTIONS.find((d) => d.value === dimension)?.label ?? "Security"

  return (
    <Card className="flex flex-col">
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="size-4" />
              Collateral Concentration
            </CardTitle>
            <CardDescription className="text-xs">
              Top collateral exposure by {dimensionLabel.toLowerCase()}
            </CardDescription>
          </div>
          {/* Dimension toggle */}
          <div className="flex rounded-md border bg-muted/50 p-0.5 text-[10px]">
            {DIMENSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDimension(opt.value)}
                className={`rounded-sm px-2 py-0.5 transition-colors ${
                  dimension === opt.value
                    ? "bg-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pb-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !data ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
            Failed to load data
          </div>
        ) : (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-help flex-col items-center rounded-lg border bg-muted/30 px-3 py-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                        HHI Score
                        <Info className="size-2.5" />
                      </span>
                      <span className={`text-lg font-bold tabular-nums ${level!.textColor}`}>
                        {(data.hhi * 10000).toFixed(0)}
                      </span>
                      <span className={`text-[10px] font-medium ${level!.textColor}`}>
                        {level!.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-64 text-pretty">
                    Herfindahl-Hirschman Index — sum of squared exposure shares (s_i/total)^2 across all groups, scaled to 0–10,000. Below 1,500 is low, 1,500–2,500 moderate, above 2,500 high concentration.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex flex-col items-center rounded-lg border bg-muted/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Top {data.topN} Share
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {formatPercent(data.topNShare)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  of {formatCurrency(data.total)}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-muted/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Distinct {dimensionLabel}s
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {data.groupCount}
                </span>
                <span className="text-[10px] text-muted-foreground">in portfolio</span>
              </div>
            </div>

            {/* Top 1 alert */}
            {data.items[0] && data.items[0].share > 0.25 && (
              <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  Largest holding: <strong className="truncate">{data.items[0].name}</strong> at{" "}
                  {formatPercent(data.items[0].share)} ({formatCurrency(data.items[0].exposure)})
                </span>
              </div>
            )}

            {/* Horizontal bar chart */}
            <ChartContainer
              config={chartConfig}
              className="w-full"
              style={{ height: Math.max(200, data.items.length * 28) }}
            >
              <BarChart
                data={data.items}
                layout="vertical"
                margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                  interval={0}
                  tickFormatter={(v: string) =>
                    v.length > 14 ? `${v.slice(0, 13)}…` : v
                  }
                />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => formatCurrency(v)}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                  {data.items.map((_, i) => (
                    <Cell
                      key={i}
                      fill={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Share breakdown */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {data.items.slice(0, 5).map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: BAR_COLORS[i] }}
                  />
                  <span className="max-w-20 truncate">{item.name}</span>
                  <span className="tabular-nums font-medium">
                    {formatPercent(item.share)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
