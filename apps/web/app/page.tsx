import { DashboardHeader } from "@/components/dashboard/header"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { CashOutChart } from "@/components/dashboard/cash-out-chart"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { StatsRow } from "@/components/dashboard/stats-row"
import { BottomTabs } from "@/components/dashboard/bottom-tabs"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader />
        <FilterBar />
      </div>

      <KpiCards />

      <div className="flex flex-col gap-6 lg:flex-row">
        <CashOutChart />
        <RecentTrades />
      </div>

      <StatsRow />

      <BottomTabs />
    </div>
  )
}
