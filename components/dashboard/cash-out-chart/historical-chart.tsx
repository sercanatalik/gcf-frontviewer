"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useHistoricalData } from "./use-cashout-data"
import {
  formatCurrency,
  processHistoricalData,
  getChartGroups,
  CHART_COLORS,
} from "./utils"
import { CustomTooltip, CustomLegend } from "./chart-tooltip"
import { ChartSkeleton } from "./chart-skeleton"

interface HistoricalChartProps {
  fieldName: string
  groupBy?: string
}

export function HistoricalChart({ fieldName, groupBy }: HistoricalChartProps) {
  const { data, isLoading, error } = useHistoricalData(fieldName, groupBy)

  const chartData = useMemo(
    () => (data?.data?.length ? processHistoricalData(data.data, fieldName) : []),
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
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          />
          {groups.map((group, i) => (
            <Bar
              key={group}
              dataKey={group}
              stackId={isStacked ? "stack" : undefined}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={
                isStacked
                  ? i === groups.length - 1
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                  : [4, 4, 0, 0]
              }
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {isStacked && <CustomLegend groups={groups} />}
    </div>
  )
}
