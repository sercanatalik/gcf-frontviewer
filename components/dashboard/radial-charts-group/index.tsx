"use client"

import { RadialChartCard } from "./radial-chart-card"
import { radialCharts } from "./data"
import { useRadialData } from "./use-radial-data"

export function RadialChartsGroup() {
  const { data, isLoading } = useRadialData(radialCharts)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {radialCharts.map((chart) => (
        <RadialChartCard
          key={chart.key}
          chart={chart}
          data={data[chart.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
