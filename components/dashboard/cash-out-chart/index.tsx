"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartBarStacked, History, CalendarClock } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { HistoricalChart } from "./historical-chart"
import { FutureChart } from "./future-chart"
import { ChartSettings } from "./chart-settings"

export function CashOutChart() {
  const [activeTab, setActiveTab] = React.useState("historical")
  const [fieldName, setFieldName] = React.useState("cashOut")
  const [groupBy, setGroupBy] = React.useState<string | undefined>(undefined)

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

        <ChartSettings
          fieldName={fieldName}
          groupBy={groupBy}
          onFieldChange={setFieldName}
          onGroupByChange={setGroupBy}
        />
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
