"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Loader2 } from "lucide-react"
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
import type { RadialChartDef } from "./data"
import type { GroupedDataPoint } from "./use-radial-data"

const COLORS = [
  "oklch(0.82 0.10 250)",
  "oklch(0.72 0.15 255)",
  "oklch(0.62 0.20 260)",
  "oklch(0.52 0.22 265)",
  "oklch(0.42 0.20 270)",
  "oklch(0.75 0.12 245)",
  "oklch(0.58 0.18 258)",
  "oklch(0.48 0.21 268)",
]

function formatValue(value: number, formatter: string): string {
  if (formatter === "currency") {
    if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toFixed(0)
  }
  if (formatter === "bps") return `${value.toFixed(1)} bps`
  if (formatter === "days") return `${value.toFixed(0)}d`
  return value.toLocaleString()
}

interface RadialChartCardProps {
  chart: RadialChartDef
  data?: GroupedDataPoint[]
  isLoading: boolean
}

export function RadialChartCard({ chart, data, isLoading }: RadialChartCardProps) {
  const groups = data ?? []
  const total = groups.reduce((sum, g) => sum + Math.abs(g.value), 0)

  // Build single data point with all groups as keys
  const chartData = [
    Object.fromEntries(groups.map((g) => [g.group, Math.abs(g.value)])),
  ]

  const chartConfig: ChartConfig = Object.fromEntries(
    groups.map((g, i) => [
      g.group,
      { label: g.group, color: COLORS[i % COLORS.length] },
    ]),
  )

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center px-4 pt-4 pb-0">
        <CardTitle className="text-sm">{chart.title}</CardTitle>
        <CardDescription className="text-xs">{chart.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center px-4 pb-0">
        {isLoading ? (
          <div className="mx-auto flex aspect-square w-full max-w-[250px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : groups.length === 0 ? (
          <div className="mx-auto flex aspect-square w-full max-w-[250px] items-center justify-center">
            <span className="text-xs text-muted-foreground">No data</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={360}
              innerRadius={80}
              outerRadius={140}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {formatValue(total, chart.formatter)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground"
                          >
                            {chart.centerLabel}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              {groups.map((g, i) => (
                <RadialBar
                  key={g.group}
                  dataKey={g.group}
                  stackId="a"
                  cornerRadius={5}
                  fill={COLORS[i % COLORS.length]}
                  className="stroke-transparent stroke-2"
                />
              ))}
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-2 pb-3 text-xs text-muted-foreground">
        {groups.map((g, i) => (
          <div key={g.group} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {g.group}
          </div>
        ))}
      </div>
    </Card>
  )
}
