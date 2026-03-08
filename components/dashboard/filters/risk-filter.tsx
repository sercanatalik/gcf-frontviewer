"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, basePath } from "@/lib/utils"
import { ListFilter, Trash2 } from "lucide-react"
import { nanoid } from "nanoid"
import * as React from "react"
import { useStore } from "@tanstack/react-store"
import { useQuery, useQueries } from "@tanstack/react-query"
import Filters, {
  AnimateChangeInHeight,
  type FilterOption,
  type FilterConfig,
} from "./filter-controls"
import { filtersStore, filtersActions } from "@/lib/store/filters"
import { dateValues } from "./filter-config"
import { isDateFilter, isSingleSelect } from "./filter-controls"

interface RiskFilterProps {
  filterTypes?: Record<string, string>
  filterOperators?: Record<string, string>
  iconMapping?: Record<string, React.ReactNode>
  operatorConfig?: Record<string, any>
}

async function fetchDistinctValues(table: string, column: string): Promise<string[]> {
  const res = await fetch(`${basePath}/api/tables/distinct?table=${table}&column=${column}`)
  if (!res.ok) return []
  return res.json()
}

function useFilterOptions(
  filterTypes: Record<string, string>,
  iconMapping: Record<string, React.ReactNode>,
  operatorConfig: Record<string, any>,
) {
  const tableName = useStore(filtersStore, (s) => s.activeTable)

  const entries = React.useMemo(() => Object.entries(filterTypes), [filterTypes])

  const queries = useQueries({
    queries: entries.map(([key, column]) => {
      return {
        queryKey: ["distinct", tableName, column] as const,
        queryFn: () => fetchDistinctValues(tableName, column),
        enabled: !!tableName && !isDateFilter(key, operatorConfig),
      }
    }),
  })

  return React.useMemo(() => {
    const options: Record<string, FilterOption[]> = {}
    entries.forEach(([key], i) => {
      if (isDateFilter(key, operatorConfig)) {
        options[key] = dateValues.map((name) => ({ name, icon: iconMapping[key] }))
      } else {
        const values = queries[i]?.data ?? []
        const sorted = operatorConfig[key]?.sortDesc ? [...values].reverse() : values
        options[key] = sorted.map((name) => ({ name, icon: iconMapping[key] }))
      }
    })
    return options
  }, [entries, queries, iconMapping, operatorConfig])
}

const ASOF_FILTER_ID = "__asofDate__"

function useDefaultAsofDate(tableName: string) {
  const { data: latestDate } = useQuery({
    queryKey: ["latest-asofDate", tableName],
    queryFn: async () => {
      const res = await fetch(`${basePath}/api/tables/distinct?table=${tableName}&column=asofDate`)
      if (!res.ok) return null
      const values: string[] = await res.json()
      return values.length > 0 ? values[values.length - 1]! : null
    },
    enabled: !!tableName,
  })

  const seeded = React.useRef(false)

  React.useEffect(() => {
    if (!latestDate || seeded.current) return
    const existing = filtersStore.state.filters.find((f) => f.id === ASOF_FILTER_ID)
    if (!existing) {
      filtersActions.addFilter({
        id: ASOF_FILTER_ID,
        type: "asofDate",
        operator: "is",
        value: [latestDate],
        field: "asofDate",
      })
    }
    seeded.current = true
  }, [latestDate])

  return latestDate
}

export function RiskFilter({
  filterTypes = {},
  filterOperators = {},
  iconMapping = {},
  operatorConfig = {},
}: RiskFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedView, setSelectedView] = React.useState<string | null>(null)
  const [commandInput, setCommandInput] = React.useState("")
  const commandInputRef = React.useRef<HTMLInputElement | null>(null)

  const tableName = useStore(filtersStore, (s) => s.activeTable)
  const latestDate = useDefaultAsofDate(tableName)

  const filters = useStore(filtersStore, (state) => state.filters)
  const hasActiveFilters = filters.some((f) => f.value?.length > 0 && f.id !== ASOF_FILTER_ID)

  const filterOptions = useFilterOptions(filterTypes, iconMapping, operatorConfig)

  const filterConfig: FilterConfig = React.useMemo(
    () => ({
      filterTypes,
      filterOperators,
      filterViewToFilterOptions: filterOptions,
    }),
    [filterTypes, filterOperators, filterOptions],
  )

  const handleAddFilter = (filterType: string, filterValue: string) => {
    const config = operatorConfig[filterType]
    const defaultOperator = config?.operators?.[0] || "is"
    const field = config?.field || filterType

    const existingFilter = filters.find((f) => f.type === filterType && f.field === field)

    if (existingFilter) {
      if (isSingleSelect(filterType, operatorConfig)) {
        filtersActions.updateFilter(existingFilter.id, { value: [filterValue] })
      } else if (!existingFilter.value.includes(filterValue)) {
        filtersActions.updateFilter(existingFilter.id, {
          value: [...existingFilter.value, filterValue],
        })
      }
    } else {
      filtersActions.addFilter({
        id: nanoid(),
        type: filterType,
        operator: defaultOperator,
        value: [filterValue],
        field,
      })
    }

    setSelectedView(null)
    setCommandInput("")
    setOpen(false)
  }

  if (Object.keys(filterTypes).length === 0) return null

  return (
    <div className="z-50 flex flex-wrap items-center gap-5">
      <Filters
        filters={filters}
        config={filterConfig}
        iconMapping={iconMapping}
        operatorConfig={operatorConfig}
      />

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="h-6 border-none text-xs text-muted-foreground transition hover:bg-transparent hover:text-red-500"
          onClick={() => {
            const asofFilter = filters.find((f) => f.id === ASOF_FILTER_ID)
            filtersActions.clearFilters()
            if (asofFilter) filtersActions.addFilter(asofFilter)
          }}
        >
          <Trash2 className="mr-0 size-3" />
          Reset
        </Button>
      )}

      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            setSelectedView(null)
            setCommandInput("")
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            size="sm"
            className={cn(
              "group flex h-8 items-center gap-1.5 rounded-sm text-sm transition",
              filters.length > 0 && "w-8",
            )}
          >
            <ListFilter className="size-4 shrink-0 text-muted-foreground transition-all group-hover:text-primary" />
            {!filters.length && "Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <AnimateChangeInHeight>
            <Command>
              <CommandInput
                placeholder={selectedView ?? "Filter..."}
                className="h-9"
                value={commandInput}
                onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
                ref={commandInputRef}
              />
              <CommandList className="max-h-[500px]">
                <CommandEmpty>No results found.</CommandEmpty>
                {selectedView ? (
                  <CommandGroup key={selectedView}>
                    {filterOptions[selectedView]?.map((filter: FilterOption) => (
                      <CommandItem
                        className="group flex items-center gap-2 text-muted-foreground"
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue) => handleAddFilter(selectedView, currentValue)}
                      >
                        {filter.icon}
                        <span className="text-accent-foreground">{filter.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandGroup>
                    {Object.keys(filterTypes).map((key) => (
                      <CommandItem
                        className="group flex items-center gap-2 text-muted-foreground"
                        key={key}
                        value={key}
                        onSelect={(currentValue) => {
                          setSelectedView(currentValue)
                          commandInputRef.current?.focus()
                        }}
                      >
                        {iconMapping[key]}
                        <span className="text-accent-foreground">{key}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </PopoverContent>
      </Popover>
    </div>
  )
}
