"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, CalendarClock, Download, Settings2 } from "lucide-react"
import { useStore } from "@tanstack/react-store"
import { HistoricalChart } from "./historical-chart"
import { FutureChart } from "./future-chart"
import { ChartSettings } from "./chart-settings"
import { useHistoricalData, useFutureData } from "./use-cashout-data"
import { processHistoricalData, processFutureData } from "./utils"
import { filtersStore, filtersActions } from "@/lib/store/filters"

function downloadCsv(
  rows: Record<string, unknown>[],
  filename: string,
) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0]!)
  const header = keys.join(",")
  const lines = rows.map((row) =>
    keys.map((k) => {
      const v = row[k]
      if (v == null) return ""
      const s = String(v)
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }).join(","),
  )
  const csv = [header, ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const CHART_HEIGHT = 400

export function CashOutChart() {
  const [fieldName, setFieldName] = React.useState("cashOut")
  const storeGroupBy = useStore(filtersStore, (s) => s.chartGroupBy)
  const [localGroupBy, setLocalGroupBy] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (storeGroupBy !== undefined) {
      setLocalGroupBy(storeGroupBy)
    }
  }, [storeGroupBy])

  const groupBy = localGroupBy

  const setGroupBy = React.useCallback((value: string | undefined) => {
    setLocalGroupBy(value)
    filtersActions.setChartGroupBy(value)
  }, [])

  const { data: historicalData } = useHistoricalData(fieldName, groupBy)
  const { data: futureData } = useFutureData(fieldName, groupBy)

  const handleDownloadHistorical = React.useCallback(() => {
    const rows = historicalData?.data?.length
      ? processHistoricalData(historicalData.data, fieldName)
      : []
    downloadCsv(rows, `historical_${fieldName}${groupBy ? `_by_${groupBy}` : ""}.csv`)
  }, [fieldName, groupBy, historicalData])

  const handleDownloadFuture = React.useCallback(() => {
    const rows = futureData?.data?.length
      ? processFutureData(futureData.data, fieldName)
      : []
    downloadCsv(rows, `future_${fieldName}${groupBy ? `_by_${groupBy}` : ""}.csv`)
  }, [fieldName, groupBy, futureData])

  const hasHistorical = (historicalData?.data?.length ?? 0) > 0
  const hasFuture = (futureData?.data?.length ?? 0) > 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-3 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="size-4" />
            Historical Cash Out
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadHistorical}
              disabled={!hasHistorical}
              title="Download CSV"
              className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Download className="size-3.5" />
            </button>
            <ChartSettings
              fieldName={fieldName}
              groupBy={groupBy}
              onFieldChange={setFieldName}
              onGroupByChange={setGroupBy}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="flex-1" style={{ minHeight: CHART_HEIGHT }}>
            <HistoricalChart fieldName={fieldName} groupBy={groupBy} height={CHART_HEIGHT} />
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="flex-row items-center justify-between gap-3 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="size-4" />
            Future Maturity Profile
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadFuture}
              disabled={!hasFuture}
              title="Download CSV"
              className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Download className="size-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-2">
          <div className="flex-1" style={{ minHeight: CHART_HEIGHT }}>
            <FutureChart fieldName={fieldName} groupBy={groupBy} height={CHART_HEIGHT} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
