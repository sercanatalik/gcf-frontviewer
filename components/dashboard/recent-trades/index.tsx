"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  TrendingUp,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { cn, basePath } from "@/lib/utils"
import { filtersStore } from "@/lib/store/filters"
import { serializeFilters } from "@/lib/filters/serialize"
import type { Trade } from "./types"
import { TradeItem } from "./trade-item"
import { TradeDetailDialog } from "./trade-detail-dialog"
import { formatCurrency } from "./utils"

const ITEMS_PER_PAGE = 9

const DEFAULT_RELATIVE_DT = 30

async function fetchTrades(sort: "recent" | "maturity", filtersParam: string, relativeDt = DEFAULT_RELATIVE_DT): Promise<Trade[]> {
  const url = new URL(`${basePath}/api/tables/recent-trades`, window.location.origin)
  url.searchParams.set("limit", "50")
  url.searchParams.set("sort", sort)
  url.searchParams.set("relativeDt", String(relativeDt))
  if (filtersParam) url.searchParams.set("filters", filtersParam)
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch trades")
  return res.json()
}

interface Stats {
  total: number
  counterparties: number
  desks: number
  regions: number
  totalFunding: number
  totalCollateral: number
  totalExposure: number
  avgMargin: number
  avgHaircut: number
  payCount: number
  recCount: number
  productBreakdown: { name: string; count: number }[]
  deskBreakdown: { name: string; count: number }[]
  regionBreakdown: { name: string; count: number }[]
  topCounterparties: { name: string; amount: number }[]
}

function getStats(trades: Trade[]): Stats {
  const counterparties = new Set(trades.map((t) => t.counterParty)).size
  const desks = new Set(trades.map((t) => t.hmsDesk)).size
  const regions = new Set(trades.map((t) => t.region)).size
  const totalFunding = trades.reduce((s, t) => s + (t.fundingAmount || 0), 0)
  const totalCollateral = trades.reduce((s, t) => s + (t.collateralAmount || 0), 0)
  const totalExposure = trades.reduce((s, t) => s + (t.financingExposure || 0), 0)
  const margins = trades.filter((t) => t.fundingMargin != null)
  const avgMargin = margins.length > 0
    ? margins.reduce((s, t) => s + t.fundingMargin, 0) / margins.length
    : 0
  const haircuts = trades.filter((t) => t.haircut != null && t.haircut > 0)
  const avgHaircut = haircuts.length > 0
    ? haircuts.reduce((s, t) => s + t.haircut, 0) / haircuts.length
    : 0
  const payCount = trades.filter((t) => t.side === "PAY").length
  const recCount = trades.filter((t) => t.side === "RECEIVE" || t.side === "REC").length

  const breakdownOf = (key: keyof Trade, limit: number) => {
    const map = new Map<string, number>()
    for (const t of trades) {
      const v = t[key] as string
      if (v) map.set(v, (map.get(v) || 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  const productBreakdown = breakdownOf("productType", 5)
  const deskBreakdown = breakdownOf("hmsDesk", 4)
  const regionBreakdown = breakdownOf("region", 4)

  // Top counterparties by absolute funding
  const cpMap = new Map<string, number>()
  for (const t of trades) {
    if (t.counterParty) cpMap.set(t.counterParty, (cpMap.get(t.counterParty) || 0) + Math.abs(t.fundingAmount || 0))
  }
  const topCounterparties = [...cpMap.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return {
    total: trades.length, counterparties, desks, regions,
    totalFunding, totalCollateral, totalExposure, avgMargin, avgHaircut,
    payCount, recCount, productBreakdown, deskBreakdown, regionBreakdown, topCounterparties,
  }
}

export function RecentTrades() {
  const [activeTab, setActiveTab] = useState("recent")
  const [page, setPage] = useState(0)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  const filters = useStore(filtersStore, (s) => s.filters)
  const filtersParam = useMemo(() => serializeFilters(filters), [filters])

  const { data: recentTrades = [], isLoading: recentLoading } = useQuery({
    queryKey: ["recent-trades", "recent", filtersParam],
    queryFn: () => fetchTrades("recent", filtersParam),
  })

  const { data: maturingTrades = [], isLoading: maturingLoading } = useQuery({
    queryKey: ["recent-trades", "maturity", filtersParam],
    queryFn: () => fetchTrades("maturity", filtersParam),
    enabled: activeTab === "maturing",
  })

  const trades = activeTab === "recent" ? recentTrades : maturingTrades
  const isLoading = activeTab === "recent" ? recentLoading : maturingLoading
  const stats = useMemo(() => getStats(trades), [trades])
  const totalPages = Math.ceil(trades.length / ITEMS_PER_PAGE)
  const paginated = trades.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(0)
  }

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade)
  }

  return (
    <>
      <Card className="flex w-full min-w-[360px] flex-col lg:w-[520px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {activeTab === "recent" ? "Recent Trades" : "Maturing Soon"}
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] tabular-nums">
              {stats.total} trades
            </Badge>
          </div>
        </CardHeader>

        {/* KPI grid */}
        <div className="px-6 pb-3">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[52px] rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <MiniStat
                label="Net Funding"
                value={formatCurrency(stats.totalFunding)}
                icon={stats.totalFunding >= 0 ? ArrowUpRight : ArrowDownRight}
                color={stats.totalFunding >= 0 ? "text-foreground" : "text-muted-foreground"}
              />
              <MiniStat
                label="Collateral"
                value={formatCurrency(stats.totalCollateral)}
                icon={Banknote}
              />
              <MiniStat
                label="Exposure"
                value={formatCurrency(stats.totalExposure)}
                icon={TrendingUp}
              />
              <MiniStat
                label="Avg Margin"
                value={`${stats.avgMargin.toFixed(2)}bp`}
              />
              <MiniStat
                label="Avg Haircut"
                value={`${stats.avgHaircut.toFixed(1)}%`}
              />
              <MiniStat
                label="PAY / REC"
                value={`${stats.payCount} / ${stats.recCount}`}
              />
            </div>
          )}
        </div>

        {/* Breakdowns */}
        {!isLoading && (
          <div className="flex flex-col gap-2 px-6 pb-3">
            {/* Desks */}
            {stats.deskBreakdown.length > 0 && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-3 shrink-0 text-muted-foreground/50" />
                <div className="flex flex-wrap gap-1">
                  {stats.deskBreakdown.map((d) => (
                    <Pill key={d.name} label={d.name} value={d.count} />
                  ))}
                </div>
              </div>
            )}
            {/* Regions */}
            {stats.regionBreakdown.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Globe className="size-3 shrink-0 text-muted-foreground/50" />
                <div className="flex flex-wrap gap-1">
                  {stats.regionBreakdown.map((r) => (
                    <Pill key={r.name} label={r.name} value={r.count} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        <CardContent className="flex-1 pt-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
              <TabsTrigger value="maturing" className="flex-1">Maturing</TabsTrigger>
            </TabsList>
            {(["recent", "maturing"] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <TradeList
                  trades={paginated}
                  variant={tab === "recent" ? "recent" : "maturing"}
                  onClick={handleTradeClick}
                  page={page}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onPrev={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <TradeDetailDialog
        trade={selectedTrade}
        open={selectedTrade !== null}
        onOpenChange={(open) => { if (!open) setSelectedTrade(null) }}
      />
    </>
  )
}

function Pill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
      {label}
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </span>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}) {
  return (
    <div className="rounded-md border bg-muted/20 px-2.5 py-2 transition-colors hover:bg-muted/40">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</p>
      <div className="mt-0.5 flex items-center gap-1">
        {Icon && <Icon className={cn("size-3", color || "text-muted-foreground")} />}
        <span className={cn("text-xs font-semibold tabular-nums", color)}>{value}</span>
      </div>
    </div>
  )
}

function TradeList({
  trades,
  variant,
  onClick,
  page,
  totalPages,
  isLoading,
  onPrev,
  onNext,
}: {
  trades: Trade[]
  variant: "recent" | "maturing"
  onClick: (trade: Trade) => void
  page: number
  totalPages: number
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-3">
            <Skeleton className="size-7 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2.5 w-2/5" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="flex h-[580px] items-center justify-center text-sm text-muted-foreground">
        No trades available
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[680px]">
        {trades.map((trade) => (
          <TradeItem key={trade.tradeId} trade={trade} variant={variant} onClick={onClick} />
        ))}
      </ScrollArea>
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={page === 0}
            className="h-7 text-xs text-muted-foreground"
          >
            <ChevronLeft className="size-3" />
            Previous
          </Button>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {page + 1} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={page === totalPages - 1}
            className="h-7 text-xs text-muted-foreground"
          >
            Next
            <ChevronRight className="size-3" />
          </Button>
        </div>
      )}
    </>
  )
}
