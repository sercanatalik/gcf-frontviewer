"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useFutureData } from "./use-cashout-data"
import {
  formatCurrency,
  processFutureData,
  getChartGroups,
  getBarColor,
} from "./utils"

interface FutureChartProps {
  fieldName: string
  groupBy?: string
}

export function FutureChart({ fieldName, groupBy }: FutureChartProps) {
  const { data, isLoading, error } = useFutureData(fieldName, groupBy)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        Loading...
      </div>
    )
  }

  if (error || !data?.data?.length) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
        {error ? "Error loading data" : "No data available"}
      </div>
    )
  }

  const chartData = processFutureData(data.data)
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
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          className="fill-muted-foreground"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
          }}
          formatter={(value) => formatCurrency(Number(value))}
        />
        <Legend />
        {groups.map((group, i) => (
          <Bar
            key={group}
            dataKey={group}
            stackId={isStacked ? "stack" : undefined}
            fill={getBarColor(group, i, isStacked)}
            radius={isStacked ? undefined : [2, 2, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
