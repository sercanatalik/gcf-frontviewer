"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { ListFilter, Trash2 } from "lucide-react"
import { nanoid } from "nanoid"
import * as React from "react"
import { useStore } from "@tanstack/react-store"
import Filters, {
  AnimateChangeInHeight,
  type FilterOption,
  type FilterConfig,
} from "./filter-controls"
import { filtersStore, filtersActions } from "@/lib/store/filters"

interface RiskFilterProps {
  filterTypes?: Record<string, string>
  filterOperators?: Record<string, string>
  iconMapping?: Record<string, React.ReactNode>
  operatorConfig?: Record<string, any>
  dateValues?: string[]
}

const dummyFilterOptions: Record<string, FilterOption[]> = {
  desk: [
    { name: "hmsSL1", icon: undefined },
    { name: "hmsSL2", icon: undefined },
    { name: "hmsSL3", icon: undefined },
  ],
  book_name: [
    { name: "BOOK_A", icon: undefined },
    { name: "BOOK_B", icon: undefined },
    { name: "BOOK_C", icon: undefined },
  ],
  counterparty_name: [
    { name: "Garda Capital Partners", icon: undefined },
    { name: "Balyasny Asset Management", icon: undefined },
    { name: "Schonfeld Strategic Advisors", icon: undefined },
    { name: "Hsbc Holdings", icon: undefined },
    { name: "Citadel Securities", icon: undefined },
  ],
  trade_type: [
    { name: "TotalReturnSwap", icon: undefined },
    { name: "Repo", icon: undefined },
    { name: "SecLending", icon: undefined },
  ],
  asset_class: [
    { name: "Equity", icon: undefined },
    { name: "Fixed Income", icon: undefined },
    { name: "Credit", icon: undefined },
  ],
  collateral_type: [
    { name: "Cash", icon: undefined },
    { name: "Government Bond", icon: undefined },
    { name: "Corporate Bond", icon: undefined },
  ],
  rating: [
    { name: "AAA", icon: undefined },
    { name: "AA", icon: undefined },
    { name: "A", icon: undefined },
    { name: "BBB", icon: undefined },
    { name: "BB", icon: undefined },
  ],
  book_region: [
    { name: "EMEA", icon: undefined },
    { name: "APAC", icon: undefined },
    { name: "AMER", icon: undefined },
  ],
  trade_dt: [
    { name: "Today", icon: undefined },
    { name: "Yesterday", icon: undefined },
    { name: "This Week", icon: undefined },
    { name: "Last Week", icon: undefined },
    { name: "This Month", icon: undefined },
  ],
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

  const filters = useStore(filtersStore, (state) => state.filters)
  const hasActiveFilters = filters.some((f) => f.value?.length > 0)

  const filterOptions = React.useMemo(() => {
    const options: Record<string, FilterOption[]> = {}
    for (const key of Object.keys(filterTypes)) {
      const baseOptions = dummyFilterOptions[key] || []
      options[key] = baseOptions.map((opt) => ({
        ...opt,
        icon: iconMapping[opt.name] || iconMapping[key],
      }))
    }
    return options
  }, [filterTypes, iconMapping])

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
      if (!existingFilter.value.includes(filterValue)) {
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
          onClick={() => filtersActions.clearFilters()}
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
              <CommandList>
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
