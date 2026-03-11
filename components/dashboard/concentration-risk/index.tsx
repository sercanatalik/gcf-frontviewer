"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import { AlertTriangle, Loader2, Shield, Users } from "lucide-react"
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
import { useConcentrationData } from "./use-concentration-data"

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/** HHI risk level: < 0.15 = low, 0.15-0.25 = moderate, > 0.25 = high */
function hhiLevel(hhi: number): { label: string; color: string; textColor: string } {
  if (hhi < 0.15) return { label: "Low", color: "oklch(0.75 0.18 145)", textColor: "text-emerald-500" }
  if (hhi < 0.25) return { label: "Moderate", color: "oklch(0.80 0.16 85)", textColor: "text-amber-500" }
  return { label: "High", color: "oklch(0.65 0.22 25)", textColor: "text-red-500" }
}

const BAR_COLORS = [
  "oklch(0.72 0.15 255)",
  "oklch(0.68 0.14 250)",
  "oklch(0.64 0.13 245)",
  "oklch(0.60 0.12 240)",
  "oklch(0.56 0.11 235)",
  "oklch(0.52 0.10 230)",
  "oklch(0.48 0.09 225)",
  "oklch(0.44 0.08 220)",
  "oklch(0.40 0.07 215)",
  "oklch(0.36 0.06 210)",
]

const chartConfig: ChartConfig = {
  exposure: { label: "Exposure" },
}

export function ConcentrationRisk() {
  const { data, isLoading, error } = useConcentrationData()

  const level = data ? hhiLevel(data.hhi) : null

  return (
    <Card className="flex flex-col">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="size-4" />
          Counterparty Concentration
        </CardTitle>
        <CardDescription className="text-xs">
          Top counterparty exposure & diversification
        </CardDescription>
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
              <div className="flex flex-col items-center rounded-lg border bg-muted/30 px-3 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  HHI Score
                </span>
                <span className={`text-lg font-bold tabular-nums ${level!.textColor}`}>
                  {(data.hhi * 10000).toFixed(0)}
                </span>
                <span className={`text-[10px] font-medium ${level!.textColor}`}>
                  {level!.label}
                </span>
              </div>
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
                  Counterparties
                </span>
                <div className="flex items-center gap-1">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="text-lg font-bold tabular-nums">
                    {data.groupCount}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">active</span>
              </div>
            </div>

            {/* Top 1 alert */}
            {data.items[0] && data.items[0].share > 0.2 && (
              <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  Largest exposure: <strong>{data.items[0].name}</strong> at{" "}
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
                  <span className="truncate max-w-20">{item.name}</span>
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
