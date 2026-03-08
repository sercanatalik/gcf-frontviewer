"use client"

import { useEffect } from "react"
import type { HTMLPerspectiveWorkspaceElement } from "@perspective-dev/workspace"
import { RiskFilter } from "./filters/risk-filter"
import {
  filterTypes,
  filterOperators,
  iconMapping,
  operatorConfig,
} from "./filters/filter-config"
import { filtersActions } from "@/lib/store/filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutMenu } from "@/components/workspace/layout-menu"

interface FilterBarProps {
  tableName?: string
  workspaceRef?: React.RefObject<HTMLPerspectiveWorkspaceElement | null>
  ready?: boolean
}

export function FilterBar({ tableName = "gcf_risk_mv", workspaceRef, ready }: FilterBarProps) {
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
      <LayoutMenu workspaceRef={workspaceRef} ready={ready} />
    </div>
  )
}
