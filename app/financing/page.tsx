import { DashboardHeader } from "@/components/dashboard/header"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { CashOutChart } from "@/components/dashboard/cash-out-chart"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { StatsRow } from "@/components/dashboard/stats-row"
import { RadialChartsGroup } from "@/components/dashboard/radial-charts-group"
import { ConcentrationRisk } from "@/components/dashboard/concentration-risk"
import { CollateralConcentration } from "@/components/dashboard/collateral-concentration"
import { BottomTabs } from "@/components/dashboard/bottom-tabs"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col gap-5 p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader />
        <FilterBar />
      </div>

      <KpiCards />

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <RadialChartsGroup />
          <StatsRow />
          <CashOutChart />
        </div>
        <RecentTrades />
      </div>

      {/* Risk Analysis Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConcentrationRisk />
        <CollateralConcentration />
      </div>

      <BottomTabs />
    </div>
  )
}
