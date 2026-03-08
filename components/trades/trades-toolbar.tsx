"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TradesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  sortDir: "asc" | "desc"
  onSortDirToggle: () => void
  side: string
  onSideChange: (value: string) => void
  total: number
  isLoading: boolean
}

const sortOptions = [
  { value: "tradeDt", label: "Trade Date" },
  { value: "maturityDt", label: "Maturity Date" },
  { value: "fundingAmount", label: "Funding Amount" },
  { value: "collateralAmount", label: "Collateral" },
  { value: "counterParty", label: "Counterparty" },
  { value: "hmsDesk", label: "Desk" },
  { value: "fundingMargin", label: "Margin" },
  { value: "cashOut", label: "Cash Out" },
]

export function TradesToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirToggle,
  side,
  onSideChange,
  total,
  isLoading,
}: TradesToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search + result count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search trades by counterparty, collateral, ticker, desk, ISIN..."
            className="h-9 pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Badge variant="secondary" className="h-6 shrink-0 tabular-nums">
          {isLoading ? "..." : total.toLocaleString()} trades
        </Badge>
      </div>

      {/* Sort + filters */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Sort
          </span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger size="sm" className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onSortDirToggle}
          >
            {sortDir === "desc" ? (
              <ArrowDownAZ className="size-3.5" />
            ) : (
              <ArrowUpAZ className="size-3.5" />
            )}
          </Button>
        </div>

        <div className="mx-1 h-4 w-px bg-border" />

        <div className="flex items-center gap-1">
          {(["", "PAY", "RECEIVE"] as const).map((value) => (
            <button
              key={value}
              onClick={() => onSideChange(value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                side === value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {value || "All"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
