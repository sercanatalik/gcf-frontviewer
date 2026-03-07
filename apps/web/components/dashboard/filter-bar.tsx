"use client"

import { RiskFilter } from "./filters/risk-filter"
import {
  filterTypes,
  filterOperators,
  iconMapping,
  operatorConfig,
  dateValues,
} from "./filters/filter-config"

export function FilterBar() {
  return (
    <RiskFilter
      filterTypes={filterTypes}
      filterOperators={filterOperators}
      iconMapping={iconMapping}
      operatorConfig={operatorConfig}
      dateValues={dateValues}
    />
  )
}
