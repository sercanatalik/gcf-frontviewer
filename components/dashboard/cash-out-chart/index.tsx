"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { BarChart3, Settings, Download, Maximize2 } from "lucide-react"
import { HistoricalChart } from "./historical-chart"
import { FutureChart } from "./future-chart"
import { FIELD_OPTIONS } from "./utils"
import { filterTypes } from "@/components/dashboard/filters/filter-config"

export function CashOutChart() {
  const [activeTab, setActiveTab] = React.useState("historical")
  const [fieldName, setFieldName] = React.useState("cashOut")
  const [groupBy, setGroupBy] = React.useState<string | undefined>(undefined)
  const [showSettings, setShowSettings] = React.useState(false)

  const groupByOptions = React.useMemo(
    () => [
      { value: "", label: "None" },
      ...Object.entries(filterTypes)
        .filter(([, col]) => !["tradeDt", "maturityDt", "asofDate"].includes(col))
        .map(([key, col]) => ({ value: col, label: key })),
    ],
    [],
  )

  const fieldLabel = FIELD_OPTIONS.find((f) => f.value === fieldName)?.label ?? fieldName

  return (
    <Card className="flex-1">
      <CardHeader className="flex-row items-center gap-2 pb-0">
        <BarChart3 className="size-4 text-muted-foreground" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList variant="line">
            <TabsTrigger value="historical">Historical {fieldLabel}</TabsTrigger>
            <TabsTrigger value="future">Future {fieldLabel}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-2 flex items-center justify-end gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="size-4" />
            </button>
            {showSettings && (
              <div className="absolute right-0 top-6 z-10 w-56 rounded-lg border bg-card p-3 shadow-lg space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Field</label>
                  <select
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                  >
                    {FIELD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Group By</label>
                  <select
                    value={groupBy || ""}
                    onChange={(e) => setGroupBy(e.target.value || undefined)}
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                  >
                    {groupByOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <Download className="size-4 text-muted-foreground" />
          <Maximize2 className="size-4 text-muted-foreground" />
        </div>

        {activeTab === "historical" ? (
          <HistoricalChart fieldName={fieldName} groupBy={groupBy} />
        ) : (
          <FutureChart fieldName={fieldName} groupBy={groupBy} />
        )}
      </CardContent>
    </Card>
  )
}
