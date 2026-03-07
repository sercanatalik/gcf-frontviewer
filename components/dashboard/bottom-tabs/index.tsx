"use client"

import { useMemo } from "react"
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

export function BottomTabs() {
  const { data, isLoading } = useBottomTabsData(tabs)

  const columnsByTab = useMemo(
    () => Object.fromEntries(tabs.map((tab) => [tab.key, createColumns(tab.groupLabel)])),
    [],
  )

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue={tabs[0]!.key}>
          <TabsList variant="line">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="pt-4">
              <DataTable
                columns={columnsByTab[tab.key]!}
                data={data[tab.key] ?? []}
                isLoading={isLoading}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
