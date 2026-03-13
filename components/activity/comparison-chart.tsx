"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CHART_COLORS } from "@/lib/chart-colors"
import type { GroupedRow } from "./types"
import { formatCurrency, formatBps } from "./utils"

interface ComparisonChartProps {
  data: GroupedRow[]
  groupLabel: string
}

type MetricKey = "funding" | "collateral" | "spread" | "trades"

const metricOptions: { value: MetricKey; label: string }[] = [
  { value: "funding", label: "Funding Amount" },
  { value: "collateral", label: "Collateral Amount" },
  { value: "spread", label: "Avg Spread (bps)" },
  { value: "trades", label: "Trade Count" },
]

function getMetricFields(metric: MetricKey): { current: keyof GroupedRow; previous: keyof GroupedRow } {
  switch (metric) {
    case "funding":
      return { current: "currentFunding", previous: "previousFunding" }
    case "collateral":
      return { current: "currentCollateral", previous: "previousCollateral" }
    case "spread":
      return { current: "currentSpread", previous: "previousSpread" }
    case "trades":
      return { current: "currentTradeCount", previous: "previousTradeCount" }
  }
}

function formatValue(value: number, metric: MetricKey): string {
  if (metric === "spread") return formatBps(value)
  if (metric === "trades") return String(Math.round(value))
  return formatCurrency(value)
}

export function ComparisonChart({ data, groupLabel }: ComparisonChartProps) {
  const [metric, setMetric] = useState<MetricKey>("funding")

  const fields = getMetricFields(metric)

  const chartData = useMemo(() => {
    // Take top 12 by current value
    return [...data]
      .sort((a, b) => Number(b[fields.current]) - Number(a[fields.current]))
      .slice(0, 12)
      .map((row) => ({
        name: String(row.group || "(blank)").slice(0, 20),
        current: Number(row[fields.current]),
        previous: Number(row[fields.previous]),
      }))
  }, [data, fields.current, fields.previous])

  const formatter = (v: number) => formatValue(v, metric)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>
          Top {groupLabel} groups — current vs previous
        </CardDescription>
        <CardAction>
          <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                tickFormatter={formatter}
                width={80}
              />
              <Tooltip
                formatter={(value: number) => formatter(value)}
                cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar
                dataKey="current"
                name="Current"
                fill={CHART_COLORS[0]}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="previous"
                name="Previous"
                fill={CHART_COLORS[4]}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
