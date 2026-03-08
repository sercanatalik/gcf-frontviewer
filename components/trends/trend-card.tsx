"use client"

import { useMemo, useId } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { TrendCardDef } from "./data"
import { useTrendData } from "./use-trend-data"
import {
  TREND_COLORS,
  formatValue,
  processSimpleData,
  processGroupedData,
  sanitizeKey,
} from "./utils"

interface TrendCardProps {
  card: TrendCardDef
}

function TrendTooltip({
  active,
  payload,
  label,
  formatter,
  groups,
}: {
  active?: boolean
  payload?: { name: string; value: number; dataKey: string; color?: string }[]
  label?: string
  formatter: string
  groups: string[]
}) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0)

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const idx = groups.indexOf(entry.dataKey)
          const color = idx >= 0 ? TREND_COLORS[idx % TREND_COLORS.length] : entry.color
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono font-medium tabular-nums">
                {formatValue(Number(entry.value), formatter)}
              </span>
            </div>
          )
        })}
      </div>
      {payload.length > 1 && (
        <div className="mt-1.5 flex items-center justify-between gap-6 border-t border-border pt-1.5">
          <span className="font-medium text-muted-foreground">Total</span>
          <span className="font-mono font-semibold tabular-nums">
            {formatValue(total, formatter)}
          </span>
        </div>
      )}
    </div>
  )
}

export function TrendCard({ card }: TrendCardProps) {
  const { data, isLoading, error } = useTrendData(card.params)

  const isGrouped = Boolean(card.params.groupBy)
  const groups = useMemo(
    () => (data?.meta?.groups ?? []).map(sanitizeKey),
    [data],
  )

  const chartData = useMemo(() => {
    if (!data?.data?.length) return []
    if (isGrouped) {
      return processGroupedData(data.data, data.meta?.groups ?? [])
    }
    return processSimpleData(data.data)
  }, [data, isGrouped])

  // Compute summary: latest value and trend
  const summary = useMemo(() => {
    if (chartData.length < 2) return null
    if (isGrouped) {
      const last = chartData[chartData.length - 1] as Record<string, unknown>
      const prev = chartData[chartData.length - 2] as Record<string, unknown>
      const lastTotal = groups.reduce((s, g) => s + (Number(last[g]) || 0), 0)
      const prevTotal = groups.reduce((s, g) => s + (Number(prev[g]) || 0), 0)
      const change = prevTotal !== 0 ? ((lastTotal - prevTotal) / Math.abs(prevTotal)) * 100 : 0
      return { latest: lastTotal, change }
    }
    const last = (chartData[chartData.length - 1] as { value: number }).value
    const prev = (chartData[chartData.length - 2] as { value: number }).value
    const change = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0
    return { latest: last, change }
  }, [chartData, groups, isGrouped])

  const Icon = card.icon

  return (
    <Card className={cn("flex flex-col", card.size === "wide" && "lg:col-span-2")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Icon className={cn("size-4", card.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-sm">{card.title}</CardTitle>
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
            </div>
          </div>
          {isLoading ? (
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          ) : summary ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-semibold tabular-nums">
                {formatValue(summary.latest, card.formatter)}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums",
                  summary.change > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : summary.change < 0
                      ? "text-red-500"
                      : "text-muted-foreground",
                )}
              >
                {summary.change > 0 ? "+" : ""}
                {summary.change.toFixed(1)}%
              </span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {isLoading ? (
          <ChartSkeleton type={card.chartType} />
        ) : error || chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {error ? "Failed to load" : "No data available"}
          </div>
        ) : (
          <div className="h-[200px]">
            {card.chartType === "area" && (
              <SimpleAreaChart
                data={chartData as { date: string; value: number }[]}
                formatter={card.formatter}
              />
            )}
            {card.chartType === "line" && (
              <SimpleLineChart
                data={chartData as { date: string; value: number }[]}
                formatter={card.formatter}
              />
            )}
            {card.chartType === "bar" && (
              <SimpleBarChart
                data={chartData as { date: string; value: number }[]}
                formatter={card.formatter}
              />
            )}
            {card.chartType === "stackedArea" && (
              <StackedAreaChart
                data={chartData}
                groups={groups}
                formatter={card.formatter}
              />
            )}
            {card.chartType === "stackedBar" && (
              <StackedBarChartComponent
                data={chartData}
                groups={groups}
                formatter={card.formatter}
              />
            )}
          </div>
        )}
        {/* Legend for grouped charts */}
        {isGrouped && groups.length > 0 && !isLoading && chartData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-2 text-[10px] text-muted-foreground">
            {groups.map((g, i) => (
              <div key={g} className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: TREND_COLORS[i % TREND_COLORS.length] }}
                />
                {g}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SimpleAreaChart({
  data,
  formatter,
}: {
  data: { date: string; value: number }[]
  formatter: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TREND_COLORS[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={TREND_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          className="text-[10px] fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, formatter)}
          tickLine={false}
          axisLine={false}
          width={55}
          className="text-[10px] fill-muted-foreground"
        />
        <Tooltip
          content={
            <TrendTooltip formatter={formatter} groups={["value"]} />
          }
          cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={TREND_COLORS[0]}
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function SimpleLineChart({
  data,
  formatter,
}: {
  data: { date: string; value: number }[]
  formatter: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          className="text-[10px] fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, formatter)}
          tickLine={false}
          axisLine={false}
          width={55}
          className="text-[10px] fill-muted-foreground"
        />
        <Tooltip
          content={
            <TrendTooltip formatter={formatter} groups={["value"]} />
          }
          cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={TREND_COLORS[0]}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function SimpleBarChart({
  data,
  formatter,
}: {
  data: { date: string; value: number }[]
  formatter: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          className="text-[10px] fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, formatter)}
          tickLine={false}
          axisLine={false}
          width={55}
          className="text-[10px] fill-muted-foreground"
        />
        <Tooltip
          content={
            <TrendTooltip formatter={formatter} groups={["value"]} />
          }
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
        />
        <Bar
          dataKey="value"
          fill={TREND_COLORS[0]}
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function StackedAreaChart({
  data,
  groups,
  formatter,
}: {
  data: Record<string, unknown>[]
  groups: string[]
  formatter: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          {groups.map((g, i) => (
            <linearGradient key={g} id={`grad-${g}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={TREND_COLORS[i % TREND_COLORS.length]}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={TREND_COLORS[i % TREND_COLORS.length]}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          className="text-[10px] fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, formatter)}
          tickLine={false}
          axisLine={false}
          width={55}
          className="text-[10px] fill-muted-foreground"
        />
        <Tooltip
          content={<TrendTooltip formatter={formatter} groups={groups} />}
          cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        {groups.map((g, i) => (
          <Area
            key={g}
            type="monotone"
            dataKey={g}
            stackId="1"
            stroke={TREND_COLORS[i % TREND_COLORS.length]}
            strokeWidth={1.5}
            fill={`url(#grad-${g})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function StackedBarChartComponent({
  data,
  groups,
  formatter,
}: {
  data: Record<string, unknown>[]
  groups: string[]
  formatter: string
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
          className="text-[10px] fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => formatValue(v, formatter)}
          tickLine={false}
          axisLine={false}
          width={55}
          className="text-[10px] fill-muted-foreground"
        />
        <Tooltip
          content={<TrendTooltip formatter={formatter} groups={groups} />}
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
        />
        {groups.map((g, i) => (
          <Bar
            key={g}
            dataKey={g}
            stackId="stack"
            fill={TREND_COLORS[i % TREND_COLORS.length]}
            radius={
              i === groups.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
            }
            maxBarSize={24}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// Deterministic heights so SSR/CSR match (no Math.random)
const AREA_POINTS = [40, 55, 48, 65, 58, 72, 60, 50, 68, 75, 62, 45, 58, 70, 52, 63, 48, 55, 67, 72]
const BAR_HEIGHTS = [45, 62, 38, 70, 55, 48, 65, 52, 58, 42]
const STACKED_BAR_SPLITS = [
  [20, 15, 10],
  [25, 20, 17],
  [15, 12, 11],
  [30, 18, 22],
  [22, 15, 18],
  [18, 14, 16],
  [28, 17, 20],
  [20, 16, 16],
  [24, 14, 20],
  [16, 12, 14],
]

function ChartSkeleton({ type }: { type: string }) {
  const id = useId()

  const shimmer = (
    <defs>
      <linearGradient id={`shimmer-${id}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--muted)" stopOpacity="0.3" />
        <stop offset="50%" stopColor="var(--muted)" stopOpacity="0.8" />
        <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.3" />
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from="-1 0"
          to="1 0"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </linearGradient>
    </defs>
  )

  if (type === "line") {
    // Animated line drawing from left to right
    const points = AREA_POINTS.map((h, i) => {
      const x = (i / (AREA_POINTS.length - 1)) * 100
      const y = 100 - h
      return `${x},${y}`
    }).join(" ")

    return (
      <div className="h-[200px] px-2 pt-4 pb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {shimmer}
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="var(--border)"
              strokeOpacity="0.3"
              strokeWidth="0.3"
            />
          ))}
          <polyline
            points={points}
            fill="none"
            stroke={`url(#shimmer-${id})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="300"
            strokeDashoffset="300"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="300"
              to="0"
              dur="1.2s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
              keyTimes="0;1"
            />
          </polyline>
        </svg>
      </div>
    )
  }

  if (type === "area" || type === "stackedArea") {
    // Animated area fill rising upward
    const points = AREA_POINTS.map((h, i) => {
      const x = (i / (AREA_POINTS.length - 1)) * 100
      const y = 100 - h
      return `${x},${y}`
    }).join(" ")
    const areaPath = `M0,100 L${AREA_POINTS.map((h, i) => `${(i / (AREA_POINTS.length - 1)) * 100},${100 - h}`).join(" L")} L100,100 Z`

    return (
      <div className="h-[200px] px-2 pt-4 pb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {shimmer}
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="var(--border)"
              strokeOpacity="0.3"
              strokeWidth="0.3"
            />
          ))}
          {/* Area fill with clip animation */}
          <clipPath id={`clip-${id}`}>
            <rect x="0" y="0" width="0" height="100">
              <animate
                attributeName="width"
                from="0"
                to="100"
                dur="1s"
                fill="freeze"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
                keyTimes="0;1"
              />
            </rect>
          </clipPath>
          <path
            d={areaPath}
            fill={`url(#shimmer-${id})`}
            fillOpacity="0.5"
            clipPath={`url(#clip-${id})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            clipPath={`url(#clip-${id})`}
          />
        </svg>
      </div>
    )
  }

  if (type === "stackedBar") {
    // Stacked bars rising from bottom
    const barW = 100 / STACKED_BAR_SPLITS.length
    const gap = barW * 0.2
    const colors = ["var(--muted)", "var(--border)", "var(--muted)"]

    return (
      <div className="h-[200px] px-2 pt-4 pb-4">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {shimmer}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="var(--border)"
              strokeOpacity="0.3"
              strokeWidth="0.3"
            />
          ))}
          {STACKED_BAR_SPLITS.map((splits, i) => {
            const x = i * barW + gap / 2
            const w = barW - gap
            let yOffset = 100
            return splits.map((h, j) => {
              yOffset -= h
              return (
                <rect
                  key={`${i}-${j}`}
                  x={x}
                  width={w}
                  fill={j === 0 ? `url(#shimmer-${id})` : colors[j % colors.length]}
                  fillOpacity={0.6 - j * 0.15}
                  rx="0.5"
                  y={100}
                  height={0}
                >
                  <animate
                    attributeName="y"
                    from="100"
                    to={yOffset}
                    dur="0.6s"
                    begin={`${i * 0.06}s`}
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.34 1.56 0.64 1"
                    keyTimes="0;1"
                  />
                  <animate
                    attributeName="height"
                    from="0"
                    to={h}
                    dur="0.6s"
                    begin={`${i * 0.06}s`}
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.34 1.56 0.64 1"
                    keyTimes="0;1"
                  />
                </rect>
              )
            })
          })}
        </svg>
      </div>
    )
  }

  // Default: bar chart skeleton with spring-up animation
  const barW = 100 / BAR_HEIGHTS.length
  const gap = barW * 0.25

  return (
    <div className="h-[200px] px-2 pt-4 pb-4">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {shimmer}
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--border)"
            strokeOpacity="0.3"
            strokeWidth="0.3"
          />
        ))}
        {BAR_HEIGHTS.map((h, i) => {
          const x = i * barW + gap / 2
          const w = barW - gap
          return (
            <rect
              key={i}
              x={x}
              width={w}
              fill={`url(#shimmer-${id})`}
              rx="0.8"
              y={100}
              height={0}
            >
              <animate
                attributeName="y"
                from="100"
                to={100 - h}
                dur="0.6s"
                begin={`${i * 0.06}s`}
                fill="freeze"
                calcMode="spline"
                keySplines="0.34 1.56 0.64 1"
                keyTimes="0;1"
              />
              <animate
                attributeName="height"
                from="0"
                to={h}
                dur="0.6s"
                begin={`${i * 0.06}s`}
                fill="freeze"
                calcMode="spline"
                keySplines="0.34 1.56 0.64 1"
                keyTimes="0;1"
              />
            </rect>
          )
        })}
      </svg>
    </div>
  )
}
