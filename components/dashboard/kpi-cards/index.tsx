"use client"

import { KpiCard } from "./kpi-card"
import { kpiMeasures, secondaryKpiMeasures, DEFAULT_RELATIVE_DAYS } from "./data"
import { useKpiData } from "./use-kpi-data"

const allMeasures = [...kpiMeasures, ...secondaryKpiMeasures]

export function KpiCards() {
  const { data, isLoading, error } = useKpiData(allMeasures, DEFAULT_RELATIVE_DAYS)

  return (
    <div className="flex flex-col gap-3">
      {/* Primary KPIs */}
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

      {/* Secondary KPIs - compact row */}
      {/* <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {secondaryKpiMeasures.map((measure) => {
          const d = data?.[measure.key]
          return (
            <div
              key={measure.key}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">{measure.label}</span>
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : d ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatKpiValue(d.current, measure.formatter)}
                  </span>
                  <span className={`flex items-center text-[10px] ${d.change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                    {d.change >= 0
                      ? <TrendingUpIcon className="size-2.5" />
                      : <TrendingDownIcon className="size-2.5" />
                    }
                    <span className="ml-0.5">{formatDelta(d.changePercent)}</span>
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          )
        })}
      </div> */}
    </div>
  )
}
