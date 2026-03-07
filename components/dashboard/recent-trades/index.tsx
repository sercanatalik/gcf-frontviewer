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
import type { Trade } from "./types"
import { TradeItem } from "./trade-item"
import { TradeDetailDialog } from "./trade-detail-dialog"

const ITEMS_PER_PAGE = 8

// Dummy data — will be replaced with ClickHouse queries
const dummyTrades: Trade[] = [
  {
    trade_id: 1, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "Repo",
    counterparty_name: "Schonfeld Strategic Advisors", start_dt: "2026-03-01", maturity_dt: "2026-06-08",
    trade_dt: "2026-03-05", funding_amount: 12_500_000, collateral_amount: 13_200_000,
    collateral_desc: "EGYTB 0 09/08/2026 EGP 364", collateral_type: "Government Bond",
    funding_spread: 70, asset_class: "Fixed Income", desk: "GCF", trader_name: "J. Smith",
    book_region: "EMEA", region_code: "EU", city: "London", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "A",
  },
  {
    trade_id: 2, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "SecLending",
    counterparty_name: "Garda Capital Partners", start_dt: "2026-03-02", maturity_dt: "2026-06-12",
    trade_dt: "2026-03-06", funding_amount: 8_300_000, collateral_amount: 9_100_000,
    collateral_desc: "EGYTB 0 12/08/26 364D", collateral_type: "Government Bond",
    funding_spread: 70, asset_class: "Fixed Income", desk: "GCF", trader_name: "A. Chen",
    book_region: "EMEA", region_code: "EU", city: "London", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "AA",
  },
  {
    trade_id: 3, as_of_date: "2026-03-07", book_name: "TRS_INF_RFD", trade_type: "TotalReturnSwap",
    counterparty_name: "Hsbc Holdings", start_dt: "2026-02-28", maturity_dt: "2026-06-25",
    trade_dt: "2026-03-04", funding_amount: -5_600_000, collateral_amount: 6_200_000,
    collateral_desc: "CGB 2.52 08/25/33 INBK", collateral_type: "Government Bond",
    funding_spread: 0, asset_class: "Fixed Income", desk: "SBL", trader_name: "M. Wong",
    book_region: "APAC", region_code: "AP", city: "Hong Kong", counterparty_type: "Bank",
    counterparty_region: "APAC", country: "GB", rating: "AA",
  },
  {
    trade_id: 4, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "Repo",
    counterparty_name: "Balyasny Asset Management", start_dt: "2026-03-01", maturity_dt: "2026-08-02",
    trade_dt: "2026-03-04", funding_amount: 15_800_000, collateral_amount: 16_900_000,
    collateral_desc: "EGYTB 0 08/02/2026 EGP 364", collateral_type: "Government Bond",
    funding_spread: 75, asset_class: "Fixed Income", desk: "GCF", trader_name: "J. Smith",
    book_region: "EMEA", region_code: "EU", city: "London", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "A",
  },
  {
    trade_id: 5, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "SecLending",
    counterparty_name: "Citadel Securities", start_dt: "2026-03-03", maturity_dt: "2026-03-14",
    trade_dt: "2026-03-05", funding_amount: 22_000_000, collateral_amount: 23_500_000,
    collateral_desc: "UST 3.875 11/30/27", collateral_type: "Government Bond",
    funding_spread: 12, asset_class: "Fixed Income", desk: "REPO", trader_name: "R. Davis",
    book_region: "AMER", region_code: "US", city: "New York", counterparty_type: "MarketMaker",
    counterparty_region: "AMER", country: "US", rating: "AAA",
  },
  {
    trade_id: 6, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "Repo",
    counterparty_name: "Millennium Management", start_dt: "2026-03-06", maturity_dt: "2026-04-06",
    trade_dt: "2026-03-06", funding_amount: 7_200_000, collateral_amount: 7_800_000,
    collateral_desc: "EGYTB 0 04/07/26 364D", collateral_type: "Government Bond",
    funding_spread: 75, asset_class: "Fixed Income", desk: "GCF", trader_name: "J. Smith",
    book_region: "EMEA", region_code: "EU", city: "London", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "A",
  },
  {
    trade_id: 7, as_of_date: "2026-03-07", book_name: "TRS_INF_RFD", trade_type: "TotalReturnSwap",
    counterparty_name: "Point72 Asset Management", start_dt: "2026-03-03", maturity_dt: "2026-09-03",
    trade_dt: "2026-03-04", funding_amount: 31_000_000, collateral_amount: 33_500_000,
    collateral_desc: "JGB 0.5 03/20/28", collateral_type: "Government Bond",
    funding_spread: 25, asset_class: "Fixed Income", desk: "SBL", trader_name: "T. Yamada",
    book_region: "APAC", region_code: "JP", city: "Tokyo", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "A",
  },
  {
    trade_id: 8, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "Repo",
    counterparty_name: "DE Shaw & Co", start_dt: "2026-03-02", maturity_dt: "2026-03-10",
    trade_dt: "2026-03-03", funding_amount: 45_000_000, collateral_amount: 47_800_000,
    collateral_desc: "BUND 2.3 02/15/33", collateral_type: "Government Bond",
    funding_spread: 8, asset_class: "Fixed Income", desk: "REPO", trader_name: "L. Mueller",
    book_region: "EMEA", region_code: "DE", city: "Frankfurt", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "AA",
  },
  {
    trade_id: 9, as_of_date: "2026-03-07", book_name: "EMS_CCS_STR", trade_type: "SecLending",
    counterparty_name: "Two Sigma Investments", start_dt: "2026-03-05", maturity_dt: "2026-05-15",
    trade_dt: "2026-03-06", funding_amount: 18_500_000, collateral_amount: 19_900_000,
    collateral_desc: "GILT 4.25 12/07/27", collateral_type: "Government Bond",
    funding_spread: 35, asset_class: "Fixed Income", desk: "GCF", trader_name: "S. Patel",
    book_region: "EMEA", region_code: "GB", city: "London", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "A",
  },
  {
    trade_id: 10, as_of_date: "2026-03-07", book_name: "TRS_INF_RFD", trade_type: "TotalReturnSwap",
    counterparty_name: "Bridgewater Associates", start_dt: "2026-02-25", maturity_dt: "2026-08-25",
    trade_dt: "2026-03-03", funding_amount: 52_000_000, collateral_amount: 55_800_000,
    collateral_desc: "UST 4.5 11/15/33", collateral_type: "Government Bond",
    funding_spread: 18, asset_class: "Fixed Income", desk: "REPO", trader_name: "R. Davis",
    book_region: "AMER", region_code: "US", city: "New York", counterparty_type: "HedgeFund",
    counterparty_region: "AMER", country: "US", rating: "AAA",
  },
]

function getStats(trades: Trade[]) {
  const counterparties = new Set(trades.map((t) => t.counterparty_name)).size
  const desks = new Set(trades.map((t) => t.desk)).size
  const regions = new Set(trades.map((t) => t.book_region)).size
  return { total: trades.length, counterparties, desks, regions }
}

export function RecentTrades() {
  const [activeTab, setActiveTab] = useState("recent")
  const [page, setPage] = useState(0)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // TODO: replace with useQuery hooks for ClickHouse
  const recentTrades = dummyTrades
  const maturingTrades = useMemo(
    () => [...dummyTrades].sort((a, b) => new Date(a.maturity_dt).getTime() - new Date(b.maturity_dt).getTime()),
    [],
  )

  const trades = activeTab === "recent" ? recentTrades : maturingTrades
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
  onPrev,
  onNext,
}: {
  trades: Trade[]
  variant: "recent" | "maturing"
  onClick: (trade: Trade) => void
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
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
          <TradeItem key={trade.trade_id} trade={trade} variant={variant} onClick={onClick} />
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
