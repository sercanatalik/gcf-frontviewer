"use client"

import { KpiCard } from "./kpi-card"
import { kpiMeasures, DEFAULT_RELATIVE_DAYS } from "./data"
import { useKpiData } from "./use-kpi-data"

export function KpiCards() {
  const { data, isLoading, error } = useKpiData(kpiMeasures, DEFAULT_RELATIVE_DAYS)

  return (
    <div className="*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiMeasures.map((measure) => (
        <KpiCard
          key={measure.key}
          measure={measure}
          data={data?.[measure.key]}
          relativeDays={DEFAULT_RELATIVE_DAYS}
          isLoading={isLoading}
          error={error}
        />
      ))}
    </div>
  )
}
