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
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(30, 90%, 55%)",
  "hsl(0, 84%, 60%)",
  "hsl(45, 85%, 50%)",
  "hsl(180, 60%, 45%)",
  "hsl(330, 70%, 55%)",
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
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm">{chart.title}</CardTitle>
        <CardDescription className="text-xs">{chart.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        {isLoading ? (
          <div className="mx-auto flex aspect-square w-full max-w-[250px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={80}
              outerRadius={130}
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
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 px-2 pb-4 text-xs text-muted-foreground">
        {groups.map((g, i) => (
          <div key={g.group} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {g.group}
          </div>
        ))}
      </div>
    </Card>
  )
}
