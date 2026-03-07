"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { Trade } from "./types"
import { TradeItem } from "./trade-item"
import { TradeDetailDialog } from "./trade-detail-dialog"

const ITEMS_PER_PAGE = 8

async function fetchTrades(sort: "recent" | "maturity"): Promise<Trade[]> {
  const res = await fetch(`/api/tables/recent-trades?limit=50&sort=${sort}`)
  if (!res.ok) throw new Error("Failed to fetch trades")
  return res.json()
}

function getStats(trades: Trade[]) {
  const counterparties = new Set(trades.map((t) => t.counterParty)).size
  const desks = new Set(trades.map((t) => t.hmsDesk)).size
  const regions = new Set(trades.map((t) => t.region)).size
  return { total: trades.length, counterparties, desks, regions }
}

export function RecentTrades() {
  const [activeTab, setActiveTab] = useState("recent")
  const [page, setPage] = useState(0)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: recentTrades = [], isLoading: recentLoading } = useQuery({
    queryKey: ["recent-trades", "recent"],
    queryFn: () => fetchTrades("recent"),
  })

  const { data: maturingTrades = [], isLoading: maturingLoading } = useQuery({
    queryKey: ["recent-trades", "maturity"],
    queryFn: () => fetchTrades("maturity"),
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
    setDialogOpen(true)
  }

  return (
    <>
      <Card className="w-full min-w-[320px] lg:w-[460px]">
        <CardHeader>
          <CardTitle>{activeTab === "recent" ? "Recent Trades" : "Maturing Soon"}</CardTitle>
          <CardDescription>
            {stats.total} trades across {stats.counterparties} counterparties, {stats.desks} desks, {stats.regions} regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
              <TabsTrigger value="maturing" className="flex-1">Maturing</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <TradeList
                trades={paginated}
                variant="recent"
                onClick={handleTradeClick}
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            </TabsContent>
            <TabsContent value="maturing">
              <TradeList
                trades={paginated}
                variant="maturing"
                onClick={handleTradeClick}
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TradeDetailDialog
        trade={selectedTrade}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
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
      <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
        Loading trades…
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
        No trades available
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[380px]">
        {trades.map((trade) => (
          <TradeItem key={trade.tradeId} trade={trade} variant={variant} onClick={onClick} />
        ))}
      </ScrollArea>
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between">
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
          <span className="text-xs tabular-nums text-muted-foreground">
            {page + 1} / {totalPages}
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
