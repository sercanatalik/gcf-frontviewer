"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, basePath } from "@/lib/utils"
import { ListFilter, Trash2, ChevronLeft, ChevronRight, Calendar, List } from "lucide-react"
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
import {
  dateValues,
  filterGroups,
  filterLabels,
  GROUP_STYLES,
  type FilterGroupDef,
} from "./filter-config"
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

  // Stabilize dependency: only recompute when actual query data changes
  const queryData = queries.map((q) => q.data)

  return React.useMemo(() => {
    const options: Record<string, FilterOption[]> = {}
    entries.forEach(([key], i) => {
      if (isDateFilter(key, operatorConfig)) {
        options[key] = dateValues.map((name) => ({ name, icon: iconMapping[key] }))
      } else {
        const values = queryData[i] ?? []
        const sorted = operatorConfig[key]?.sortDesc ? [...values].reverse() : values
        options[key] = sorted.map((name) => ({ name, icon: iconMapping[key] }))
      }
    })
    return options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, queryData, iconMapping, operatorConfig])
}

const ASOF_FILTER_ID = "__asOfDate__"

function useDefaultAsofDate(tableName: string) {
  const { data: latestDate } = useQuery({
    queryKey: ["latest-asOfDate", tableName],
    queryFn: async () => {
      const res = await fetch(`${basePath}/api/tables/distinct?table=${tableName}&column=asOfDate`)
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
        type: "asOfDate",
        operator: "is",
        value: [latestDate],
        field: "asOfDate",
      })
    }
    seeded.current = true
  }, [latestDate])

  return latestDate
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the group a field key belongs to */
function findGroupForField(fieldKey: string): FilterGroupDef | undefined {
  return filterGroups.find((g) => g.fields.includes(fieldKey))
}

/** Match a field key/label against a search term */
function matchesFieldSearch(fieldKey: string, search: string): boolean {
  if (!search) return true
  const lower = search.toLowerCase()
  const label = filterLabels[fieldKey] || fieldKey
  return label.toLowerCase().includes(lower) || fieldKey.toLowerCase().includes(lower)
}

// ---------------------------------------------------------------------------
// RiskFilter
// ---------------------------------------------------------------------------

export function RiskFilter({
  filterTypes = {},
  filterOperators = {},
  iconMapping = {},
  operatorConfig = {},
}: RiskFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeGroup, setActiveGroup] = React.useState<FilterGroupDef | null>(null)
  const [activeField, setActiveField] = React.useState<string | null>(null)
  const [showAll, setShowAll] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const tableName = useStore(filtersStore, (s) => s.activeTable)
  useDefaultAsofDate(tableName)

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

  // --- Navigation ---
  const reset = () => {
    setSearch("")
    setActiveGroup(null)
    setActiveField(null)
    setShowAll(false)
  }

  const goBack = () => {
    setSearch("")
    if (activeField) {
      setActiveField(null)
    } else if (activeGroup) {
      setActiveGroup(null)
    }
  }

  const view: "categories" | "fields" | "values" = activeField
    ? "values"
    : activeGroup
      ? "fields"
      : "categories"

  // --- Smart search: find matching fields across all groups ---
  const searchResults = React.useMemo(() => {
    if (!search || view !== "categories") return null
    const results: { group: FilterGroupDef; fields: string[] }[] = []
    for (const group of filterGroups) {
      const matching = group.fields.filter((key) => matchesFieldSearch(key, search))
      if (matching.length > 0) {
        results.push({ group, fields: matching })
      }
    }
    return results
  }, [search, view])

  // --- Active filter count per group ---
  const activeCountByGroup = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const group of filterGroups) {
      counts[group.key] = filters.filter(
        (f) => group.fields.includes(f.type) && f.value?.length > 0,
      ).length
    }
    return counts
  }, [filters])

  // --- Filtered lists for fields/values views (compute once, avoid double-filter) ---
  const filteredFields = React.useMemo(() => {
    if (view !== "fields" || !activeGroup) return []
    return activeGroup.fields.filter((key) => matchesFieldSearch(key, search))
  }, [view, activeGroup, search])

  const filteredValues = React.useMemo(() => {
    if (view !== "values" || !activeField) return []
    const opts = filterOptions[activeField] ?? []
    if (!search) return opts
    const lower = search.toLowerCase()
    return opts.filter((opt) => opt.name.toLowerCase().includes(lower))
  }, [view, activeField, search, filterOptions])

  // --- Toggle a filter value (add/remove) ---
  const handleToggleValue = (fieldKey: string, value: string) => {
    const config = operatorConfig[fieldKey]
    const defaultOperator = config?.operators?.[0] || "is"
    const field = config?.field || fieldKey

    const existingFilter = filters.find((f) => f.type === fieldKey && f.field === field)

    if (isSingleSelect(fieldKey, operatorConfig)) {
      if (existingFilter) {
        filtersActions.updateFilter(existingFilter.id, { value: [value] })
      } else {
        filtersActions.addFilter({
          id: nanoid(),
          type: fieldKey,
          operator: defaultOperator,
          value: [value],
          field,
        })
      }
      setActiveField(null)
      setSearch("")
      return
    }

    if (existingFilter) {
      if (existingFilter.value.includes(value)) {
        const newValues = existingFilter.value.filter((v) => v !== value)
        if (newValues.length === 0) {
          filtersActions.removeFilter(existingFilter.id)
        } else {
          filtersActions.updateFilter(existingFilter.id, { value: newValues })
        }
      } else {
        filtersActions.updateFilter(existingFilter.id, {
          value: [...existingFilter.value, value],
        })
      }
    } else {
      filtersActions.addFilter({
        id: nanoid(),
        type: fieldKey,
        operator: defaultOperator,
        value: [value],
        field,
      })
    }
  }

  // --- Navigate to a field's values ---
  const openField = (fieldKey: string, group?: FilterGroupDef) => {
    setActiveGroup(group ?? findGroupForField(fieldKey) ?? null)
    setActiveField(fieldKey)
    setSearch("")
    setTimeout(() => inputRef.current?.focus(), 0)
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
          if (!v) reset()
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
        <PopoverContent className="w-[300px] p-0" align="start">
          <AnimateChangeInHeight>
            <Command shouldFilter={false}>
              {/* Breadcrumb navigation header */}
              {view !== "categories" && (
                <div className="flex items-center gap-1.5 border-b px-3 py-1.5">
                  <button
                    onClick={goBack}
                    className="flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  {activeGroup && (
                    <>
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          GROUP_STYLES[activeGroup.color]?.dot,
                        )}
                      />
                      <button
                        onClick={() => {
                          setActiveField(null)
                          setSearch("")
                        }}
                        className={cn(
                          "text-xs font-medium transition-colors",
                          activeField
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-foreground",
                        )}
                      >
                        {activeGroup.label}
                      </button>
                    </>
                  )}
                  {activeField && (
                    <>
                      <ChevronRight className="size-3 text-muted-foreground/50" />
                      <span className="text-xs font-medium text-foreground">
                        {filterLabels[activeField] || activeField}
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center pr-1.5 [&>[data-slot=command-input-wrapper]]:flex-1">
                <CommandInput
                  ref={inputRef}
                  placeholder={
                    showAll
                      ? "Search all filters..."
                      : view === "categories"
                        ? "Search filters..."
                        : view === "fields"
                          ? `Search ${activeGroup?.label ?? ""}...`
                          : "Search values..."
                  }
                  className="h-9"
                  value={search}
                  onInputCapture={(e) => setSearch(e.currentTarget.value)}
                />
                {view === "categories" && (
                  <button
                    onClick={() => {
                      setShowAll((v) => !v)
                      setSearch("")
                    }}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                      showAll
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground",
                    )}
                    title={showAll ? "Show grouped" : "Show all filters"}
                  >
                    <List className="size-3.5" />
                  </button>
                )}
              </div>

              <CommandList className="max-h-[400px]">
                {/* ========== Flat "show all" view ========== */}
                {view === "categories" && showAll && (
                  <>
                    {filterGroups.map((group) => {
                      const style = GROUP_STYLES[group.color]
                      const matchingFields = group.fields.filter((key) =>
                        matchesFieldSearch(key, search),
                      )
                      if (matchingFields.length === 0) return null
                      return (
                        <CommandGroup
                          key={group.key}
                          heading={
                            <span className="flex items-center gap-1.5">
                              <span className={cn("size-1.5 rounded-full", style?.dot)} />
                              {group.label}
                            </span>
                          }
                        >
                          {matchingFields.map((fieldKey) => (
                            <CommandItem
                              key={fieldKey}
                              value={fieldKey}
                              onSelect={() => openField(fieldKey, group)}
                              className="group flex items-center gap-2 text-muted-foreground"
                            >
                              {iconMapping[fieldKey]}
                              <span className="text-accent-foreground">
                                {filterLabels[fieldKey] || fieldKey}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )
                    })}
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        value="asOfDate"
                        onSelect={() => openField("asOfDate")}
                        className="group flex items-center gap-2 text-muted-foreground"
                      >
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span className="text-accent-foreground">As Of Date</span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}

                {/* ========== Categories view (default) ========== */}
                {view === "categories" && !showAll && !searchResults && (
                  <>
                    <CommandGroup>
                      {filterGroups.map((group) => {
                        const style = GROUP_STYLES[group.color]
                        const activeCount = activeCountByGroup[group.key] || 0
                        return (
                          <CommandItem
                            key={group.key}
                            value={group.key}
                            onSelect={() => {
                              setActiveGroup(group)
                              setSearch("")
                              setTimeout(() => inputRef.current?.focus(), 0)
                            }}
                            className="flex items-center gap-2.5 py-2.5"
                          >
                            <div
                              className={cn(
                                "flex size-6 items-center justify-center rounded-md",
                                style?.bg,
                              )}
                            >
                              <div className={cn("size-2 rounded-full", style?.dot)} />
                            </div>
                            <span className="flex-1 text-sm font-medium">{group.label}</span>
                            {activeCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-4 min-w-5 justify-center px-1 text-[10px] font-semibold"
                              >
                                {activeCount}
                              </Badge>
                            )}
                            <CommandShortcut>
                              <span className="mr-1 text-[11px] text-muted-foreground/60">
                                {group.fields.length}
                              </span>
                              <ChevronRight className="size-3.5 text-muted-foreground/40" />
                            </CommandShortcut>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        value="asOfDate"
                        onSelect={() => openField("asOfDate")}
                        className="flex items-center gap-2.5 py-2"
                      >
                        <div className="flex size-6 items-center justify-center rounded-md bg-muted">
                          <Calendar className="size-3.5 text-muted-foreground" />
                        </div>
                        <span className="flex-1 text-sm">As Of Date</span>
                        <CommandShortcut>
                          <ChevronRight className="size-3.5 text-muted-foreground/40" />
                        </CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}

                {/* ========== Global search results ========== */}
                {view === "categories" && !showAll && searchResults && (
                  <>
                    {searchResults.length === 0 && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No matching filters.
                      </div>
                    )}
                    {searchResults.map(({ group, fields }) => {
                      const style = GROUP_STYLES[group.color]
                      return (
                        <CommandGroup
                          key={group.key}
                          heading={
                            <span className="flex items-center gap-1.5">
                              <span
                                className={cn("size-1.5 rounded-full", style?.dot)}
                              />
                              {group.label}
                            </span>
                          }
                        >
                          {fields.map((fieldKey) => {
                            const hasFilter = filters.some(
                              (f) => f.type === fieldKey && f.value?.length > 0,
                            )
                            return (
                              <CommandItem
                                key={fieldKey}
                                value={fieldKey}
                                onSelect={() => openField(fieldKey, group)}
                                className="flex items-center gap-2"
                              >
                                {iconMapping[fieldKey]}
                                <span className="flex-1 text-sm">
                                  {filterLabels[fieldKey] || fieldKey}
                                </span>
                                {hasFilter && (
                                  <div className="size-1.5 rounded-full bg-primary" />
                                )}
                                <CommandShortcut>
                                  <ChevronRight className="size-3.5 text-muted-foreground/40" />
                                </CommandShortcut>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      )
                    })}
                  </>
                )}

                {/* ========== Fields view (group selected) ========== */}
                {view === "fields" && activeGroup && (
                  <CommandGroup>
                    {filteredFields.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No matching fields.
                      </div>
                    ) : (
                      filteredFields.map((fieldKey) => {
                        const activeValues = filters.find(
                          (f) => f.type === fieldKey && f.value?.length > 0,
                        )?.value
                        return (
                          <CommandItem
                            key={fieldKey}
                            value={fieldKey}
                            onSelect={() => openField(fieldKey, activeGroup)}
                            className="flex items-center gap-2 py-2"
                          >
                            {iconMapping[fieldKey]}
                            <span className="flex-1 text-sm">
                              {filterLabels[fieldKey] || fieldKey}
                            </span>
                            {activeValues && (
                              <Badge
                                variant="outline"
                                className="h-4 max-w-24 truncate px-1.5 text-[10px] font-normal text-muted-foreground"
                              >
                                {activeValues.length === 1
                                  ? activeValues[0]
                                  : `${activeValues.length} selected`}
                              </Badge>
                            )}
                            <CommandShortcut>
                              <ChevronRight className="size-3.5 text-muted-foreground/40" />
                            </CommandShortcut>
                          </CommandItem>
                        )
                      })
                    )}
                  </CommandGroup>
                )}

                {/* ========== Values view (field selected) ========== */}
                {view === "values" && activeField && (
                  <CommandGroup>
                    {filteredValues.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No matching values.
                      </div>
                    ) : (
                      filteredValues.map((filter) => {
                        const isSelected = filters.some(
                          (f) =>
                            f.type === activeField && f.value?.includes(filter.name),
                        )
                        return (
                          <CommandItem
                            key={filter.name}
                            value={filter.name}
                            data-checked={isSelected || undefined}
                            onSelect={(val) => handleToggleValue(activeField, val)}
                            className="flex items-center gap-2"
                          >
                            {filter.icon}
                            <span
                              className={cn(
                                "flex-1 text-sm",
                                isSelected && "font-medium text-foreground",
                              )}
                            >
                              {filter.name}
                            </span>
                          </CommandItem>
                        )
                      })
                    )}
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
