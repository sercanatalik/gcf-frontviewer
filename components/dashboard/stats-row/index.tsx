"use client"

import { StatItem } from "./stat-item"
import { statMeasures, DEFAULT_RELATIVE_DAYS } from "./data"
import { useStatsData } from "./use-stats-data"

export function StatsRow() {
  const { data, isLoading } = useStatsData(statMeasures, DEFAULT_RELATIVE_DAYS)

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {statMeasures.map((measure) => (
        <StatItem
          key={measure.key}
          measure={measure}
          data={data?.[measure.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
