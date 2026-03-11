"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartBarStacked, History, CalendarClock, Download } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
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

export function CashOutChart() {
  const [activeTab, setActiveTab] = React.useState("historical")
  const [fieldName, setFieldName] = React.useState("cashOut")
  const storeGroupBy = useStore(filtersStore, (s) => s.chartGroupBy)
  const [localGroupBy, setLocalGroupBy] = React.useState<string | undefined>(undefined)

  // Sync from store when bottom tabs change
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

  const handleDownload = React.useCallback(() => {
    if (activeTab === "historical") {
      const rows = historicalData?.data?.length
        ? processHistoricalData(historicalData.data, fieldName)
        : []
      downloadCsv(rows, `historical_${fieldName}${groupBy ? `_by_${groupBy}` : ""}.csv`)
    } else {
      const rows = futureData?.data?.length
        ? processFutureData(futureData.data, fieldName)
        : []
      downloadCsv(rows, `future_${fieldName}${groupBy ? `_by_${groupBy}` : ""}.csv`)
    }
  }, [activeTab, fieldName, groupBy, historicalData, futureData])

  const hasData =
    activeTab === "historical"
      ? (historicalData?.data?.length ?? 0) > 0
      : (futureData?.data?.length ?? 0) > 0

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 pb-0">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-3/10">
            <ChartBarStacked className="size-4 text-chart-3" />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="line">
              <TabsTrigger value="historical" className="gap-1.5">
                <History className="size-3.5" />
                Historical
              </TabsTrigger>
              <TabsTrigger value="future" className="gap-1.5">
                <CalendarClock className="size-3.5" />
                Future
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            disabled={!hasData}
            title="Download CSV"
            className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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

      <CardContent className="relative pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "future" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "future" ? -20 : 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {activeTab === "historical" ? (
              <HistoricalChart fieldName={fieldName} groupBy={groupBy} />
            ) : (
              <FutureChart fieldName={fieldName} groupBy={groupBy} />
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
