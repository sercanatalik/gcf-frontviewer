"use client"

import { useEffect } from "react"
import { RiskFilter } from "./filters/risk-filter"
import {
  filterTypes,
  filterOperators,
  iconMapping,
  operatorConfig,
} from "./filters/filter-config"
import { filtersActions } from "@/lib/store/filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavMenu } from "@/components/nav-menu"

interface FilterBarProps {
  tableName?: string
}

export function FilterBar({ tableName = "gcf_risk_mv" }: FilterBarProps) {
  useEffect(() => {
    filtersActions.setActiveTable(tableName)
  }, [tableName])

  return (
    <div className="flex items-center gap-2">
      <RiskFilter
        filterTypes={filterTypes}
        filterOperators={filterOperators}
        iconMapping={iconMapping}
        operatorConfig={operatorConfig}
      />
      <ThemeToggle />
      <NavMenu />
    </div>
  )
}
