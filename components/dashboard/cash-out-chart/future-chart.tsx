"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useFutureData } from "./use-cashout-data"
import {
  formatCurrency,
  processFutureData,
  getChartGroups,
  getGroupColor,
} from "./utils"
import { ChartTooltip } from "./chart-tooltip"
import { ChartSkeleton } from "./chart-skeleton"

interface FutureChartProps {
  fieldName: string
  groupBy?: string
}

export function FutureChart({ fieldName, groupBy }: FutureChartProps) {
  const { data, isLoading, error } = useFutureData(fieldName, groupBy)

  if (isLoading) return <ChartSkeleton />

  if (error || !data?.data?.length) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        {error ? "Failed to load data" : "No data available"}
      </div>
    )
  }

  const chartData = processFutureData(data.data, fieldName)
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        No data available
      </div>
    )
  }

  const groups = getChartGroups(chartData)
  const isStacked = Boolean(data.meta.groupBy)

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <defs>
          {groups.map((group, i) => {
            const color = getGroupColor(i)
            return (
              <linearGradient key={group} id={`grad-future-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={isStacked ? 0.8 : 0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border/50"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
          className="fill-muted-foreground"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={60}
          className="fill-muted-foreground"
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }} />
        {groups.map((group, i) => (
          <Area
            key={group}
            type="monotone"
            dataKey={group}
            stackId={isStacked ? "stack" : undefined}
            stroke={getGroupColor(i)}
            strokeWidth={2}
            fill={`url(#grad-future-${i})`}
            dot={false}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              stroke: "var(--card)",
              fill: getGroupColor(i),
            }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
