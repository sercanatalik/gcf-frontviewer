"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, ChevronDown, History, CalendarClock } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { HistoricalChart } from "./historical-chart"
import { FutureChart } from "./future-chart"
import { FIELD_OPTIONS } from "./utils"
import { filterTypes } from "@/components/dashboard/filters/filter-config"

export function CashOutChart() {
  const [activeTab, setActiveTab] = React.useState("historical")
  const [fieldName, setFieldName] = React.useState("cashOut")
  const [groupBy, setGroupBy] = React.useState<string | undefined>(undefined)
  const [showSettings, setShowSettings] = React.useState(false)
  const settingsRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false)
      }
    }
    if (showSettings) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSettings])

  const groupByOptions = React.useMemo(
    () => [
      { value: "", label: "None" },
      ...Object.entries(filterTypes)
        .filter(([, col]) => !["tradeDt", "maturityDt", "asofDate"].includes(col))
        .map(([key, col]) => ({ value: col, label: key })),
    ],
    [],
  )

  const fieldLabel =
    FIELD_OPTIONS.find((f) => f.value === fieldName)?.label ?? fieldName
  const groupByLabel =
    groupByOptions.find((o) => o.value === (groupBy || ""))?.label ?? "None"

  return (
    <Card className="flex-1 overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 pb-0">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-3/10">
            <TrendingUp className="size-4 text-chart-3" />
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

        <div className="relative flex items-center gap-2" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="font-medium">{fieldLabel}</span>
            {groupBy && (
              <>
                <span className="text-border">|</span>
                <span>{groupByLabel}</span>
              </>
            )}
            <ChevronDown className={`size-3 transition-transform ${showSettings ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-20 w-60 rounded-xl border border-border/60 bg-card p-4 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Metric
                    </label>
                    <div className="grid gap-1">
                      {FIELD_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setFieldName(o.value)}
                          className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                            fieldName === o.value
                              ? "bg-chart-3/10 font-medium text-chart-3"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Group By
                    </label>
                    <select
                      value={groupBy || ""}
                      onChange={(e) => setGroupBy(e.target.value || undefined)}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-chart-3/50"
                    >
                      {groupByOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
