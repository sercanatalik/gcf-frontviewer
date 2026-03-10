"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useFutureData } from "./use-cashout-data"
import {
  formatCurrency,
  processFutureData,
  getChartGroups,
  CHART_COLORS,
} from "./utils"
import { CustomTooltip, CustomLegend } from "./chart-tooltip"
import { ChartSkeleton } from "./chart-skeleton"

interface FutureChartProps {
  fieldName: string
  groupBy?: string
}

export function FutureChart({ fieldName, groupBy }: FutureChartProps) {
  const { data, isLoading, error } = useFutureData(fieldName, groupBy)

  const chartData = useMemo(
    () => (data?.data?.length ? processFutureData(data.data, fieldName) : []),
    [data, fieldName],
  )

  const groups = useMemo(() => getChartGroups(chartData), [chartData])
  const isStacked = Boolean(data?.meta?.groupBy)

  if (isLoading) return <ChartSkeleton />

  if (error || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        {error ? "Failed to load data" : "No data available"}
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            {groups.map((group, i) => (
              <linearGradient key={group} id={`fill-future-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            minTickGap={32}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={false}
            width={60}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip
            content={<CustomTooltip groups={groups} />}
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
          />
          {groups.map((group, i) => (
            <Area
              key={group}
              type="monotone"
              dataKey={group}
              stackId={isStacked ? "stack" : undefined}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#fill-future-${i})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      {isStacked && <CustomLegend groups={groups} />}
    </div>
  )
}
