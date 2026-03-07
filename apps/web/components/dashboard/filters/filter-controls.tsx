"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { Check, CircleDashed, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { type Filter, filtersActions } from "@/lib/store/filters"

export type { Filter }

export interface FilterOption {
  name: string
  icon: React.ReactNode | undefined
  label?: string
}

export interface FilterConfig {
  filterTypes: Record<string, string>
  filterOperators: Record<string, string>
  filterViewToFilterOptions: Record<string, FilterOption[]>
}

export function AnimateChangeInHeight({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | "auto">("auto")

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0]?.contentRect.height ?? 0
        setHeight(observedHeight)
      })
      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.1, ease: "easeIn" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  )
}

function FilterIcon({
  type,
  iconMapping,
}: {
  type: string
  iconMapping: Record<string, React.ReactNode>
}) {
  return iconMapping[type] || <CircleDashed className="size-3.5" />
}

function getFilterOperators(
  filterType: string,
  operatorConfig: Record<string, any>,
): string[] {
  const config = operatorConfig[filterType]
  if (!config?.operators || !Array.isArray(config.operators)) return []
  return config.operators
}

function isDateFilter(filterType: string, operatorConfig: Record<string, any>): boolean {
  return operatorConfig[filterType]?.type === "date"
}

function FilterOperatorDropdown({
  filterType,
  operator,
  setOperator,
  operatorConfig,
}: {
  filterType: string
  operator: string
  setOperator: (operator: string) => void
  operatorConfig: Record<string, any>
}) {
  const operators = getFilterOperators(filterType, operatorConfig)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="shrink-0 bg-muted px-1.5 py-1 text-muted-foreground transition hover:bg-muted/50 hover:text-primary">
        {operator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit min-w-fit">
        {operators.map((op) => (
          <DropdownMenuItem key={op} onClick={() => setOperator(op)}>
            {op}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilterValueCombobox({
  filterType,
  filterValues,
  setFilterValues,
  filterViewToFilterOptions,
  iconMapping,
}: {
  filterType: string
  filterValues: string[]
  setFilterValues: (filterValues: string[]) => void
  filterViewToFilterOptions: Record<string, FilterOption[]>
  iconMapping: Record<string, React.ReactNode>
}) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const nonSelectedFilterValues = filterViewToFilterOptions[filterType]?.filter(
    (filter) => !filterValues.includes(filter.name),
  )

  const closeAndReset = () => {
    setOpen(false)
    setCommandInput("")
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCommandInput("") }}>
      <PopoverTrigger className="shrink-0 rounded-none bg-muted px-1.5 py-1 text-muted-foreground transition hover:bg-muted/50 hover:text-primary">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1.5">
            <AnimatePresence mode="popLayout">
              {filterValues?.slice(0, 3).map((value) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FilterIcon type={value} iconMapping={iconMapping} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filterValues?.length === 1 ? filterValues[0] : `${filterValues?.length} selected`}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterValues.map((value) => (
                  <CommandItem
                    key={value}
                    className="group flex items-center gap-2"
                    onSelect={() => {
                      setFilterValues(filterValues.filter((v) => v !== value))
                      closeAndReset()
                    }}
                  >
                    <Checkbox checked={true} />
                    <FilterIcon type={value} iconMapping={iconMapping} />
                    {value}
                  </CommandItem>
                ))}
              </CommandGroup>
              {(nonSelectedFilterValues?.length ?? 0) > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    {nonSelectedFilterValues?.map((filter: FilterOption) => (
                      <CommandItem
                        className="group flex items-center gap-2"
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue: string) => {
                          setFilterValues([...filterValues, currentValue])
                          closeAndReset()
                        }}
                      >
                        <Checkbox checked={false} className="opacity-0 group-data-[selected=true]:opacity-100" />
                        {filter.icon}
                        <span className="text-accent-foreground">{filter.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  )
}

function FilterValueDateCombobox({
  filterType,
  filterValues,
  setFilterValues,
  filterViewToFilterOptions,
}: {
  filterType: string
  filterValues: string[]
  setFilterValues: (filterValues: string[]) => void
  filterViewToFilterOptions: Record<string, FilterOption[]>
}) {
  const [open, setOpen] = useState(false)
  const [commandInput, setCommandInput] = useState("")

  const closeAndReset = () => {
    setOpen(false)
    setCommandInput("")
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCommandInput("") }}>
      <PopoverTrigger className="shrink-0 rounded-none bg-muted px-1.5 py-1 text-muted-foreground transition hover:bg-muted/50 hover:text-primary">
        {filterValues?.[0]}
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => setCommandInput(e.currentTarget.value)}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterViewToFilterOptions[filterType]?.map((filter: FilterOption) => (
                  <CommandItem
                    className="group flex items-center gap-2"
                    key={filter.name}
                    value={filter.name}
                    onSelect={(currentValue: string) => {
                      setFilterValues([currentValue])
                      closeAndReset()
                    }}
                  >
                    <span className="text-accent-foreground">{filter.name}</span>
                    <Check className={cn("ml-auto", filterValues.includes(filter.name) ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </PopoverContent>
    </Popover>
  )
}

interface FiltersProps {
  filters: Filter[]
  config: FilterConfig
  iconMapping: Record<string, React.ReactNode>
  operatorConfig: Record<string, any>
}

export default function Filters({
  filters,
  config,
  iconMapping,
  operatorConfig,
}: FiltersProps) {
  return (
    <div className="flex gap-2">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => (
          <div key={filter.id} className="flex items-center gap-[1px] text-xs">
            <div className="flex shrink-0 items-center gap-1.5 rounded-l bg-muted px-1.5 py-1">
              <FilterIcon type={filter.type} iconMapping={iconMapping} />
              {filter.type}
            </div>
            <FilterOperatorDropdown
              filterType={filter.type}
              operator={filter.operator}
              operatorConfig={operatorConfig}
              setOperator={(operator) => {
                filtersActions.updateFilter(filter.id, { operator })
              }}
            />
            {isDateFilter(filter.type, operatorConfig) ? (
              <FilterValueDateCombobox
                filterType={filter.type}
                filterValues={filter.value}
                filterViewToFilterOptions={config.filterViewToFilterOptions}
                setFilterValues={(filterValues) => {
                  filtersActions.updateFilter(filter.id, { value: filterValues })
                }}
              />
            ) : (
              <FilterValueCombobox
                filterType={filter.type}
                filterValues={filter.value}
                filterViewToFilterOptions={config.filterViewToFilterOptions}
                iconMapping={iconMapping}
                setFilterValues={(filterValues) => {
                  filtersActions.updateFilter(filter.id, { value: filterValues })
                }}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => filtersActions.removeFilter(filter.id)}
              className="size-6 shrink-0 rounded-l-none rounded-r-sm bg-muted text-muted-foreground transition hover:bg-muted/50 hover:text-primary"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
    </div>
  )
}
