"use client"

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { tabs } from "./data"
import { useBottomTabsData } from "./use-bottom-tabs-data"
import { createColumns } from "./columns"
import { DataTable } from "./data-table"
import { filtersActions } from "@/lib/store/filters"
import type { TabRow } from "./use-bottom-tabs-data"

export function BottomTabs() {
  const router = useRouter()
  const { data, isLoading } = useBottomTabsData(tabs)

  const columnsByTab = useMemo(
    () => Object.fromEntries(tabs.map((tab) => [tab.key, createColumns(tab.groupLabel)])),
    [],
  )

  const tabByKey = useMemo(
    () => new Map(tabs.map((t) => [t.key, t])),
    [],
  )

  const handleTabChange = useCallback((key: string) => {
    const tab = tabByKey.get(key)
    if (tab) {
      filtersActions.setChartGroupBy(tab.groupBy)
    }
  }, [tabByKey])

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue={tabs[0]!.key} onValueChange={handleTabChange}>
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-4 text-chart-3" />
            <TabsList variant="line">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="pt-4">
              <DataTable
                columns={columnsByTab[tab.key]!}
                data={data[tab.key] ?? []}
                isLoading={isLoading}
                onRowClick={(row: TabRow) => {
                  const params = new URLSearchParams({
                    field: tab.groupBy,
                    value: row.group,
                    label: row.group,
                  })
                  router.push(`/dashboard/deep-dive?${params}`)
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
