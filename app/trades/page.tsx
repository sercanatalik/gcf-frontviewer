import { DashboardHeader } from "@/components/dashboard/header"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { TradesExplorer } from "@/components/trades"

export default function TradesPage() {
  return (
    <div className="flex min-h-svh flex-col gap-5 p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <DashboardHeader />
        <FilterBar />
      </div>
      <TradesExplorer />
    </div>
  )
}
