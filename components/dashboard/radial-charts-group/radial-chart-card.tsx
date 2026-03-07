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
import type { RadialDataPoint } from "./use-radial-data"

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
  data?: RadialDataPoint
  isLoading: boolean
}

export function RadialChartCard({ chart, data, isLoading }: RadialChartCardProps) {
  const primary = data?.primary ?? 0
  const secondary = data?.secondary ?? 0
  const total = primary + secondary

  const chartData = [{ primary, secondary }]

  const chartConfig: ChartConfig = {
    primary: {
      label: chart.measures.primary.label,
      color: chart.measures.primary.color,
    },
    secondary: {
      label: chart.measures.secondary.label,
      color: chart.measures.secondary.color,
    },
  }

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
              <RadialBar
                dataKey="primary"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-primary)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="secondary"
                fill="var(--color-secondary)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <div className="flex justify-center gap-4 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: chart.measures.primary.color }} />
          {chart.measures.primary.label}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: chart.measures.secondary.color }} />
          {chart.measures.secondary.label}
        </div>
      </div>
    </Card>
  )
}
