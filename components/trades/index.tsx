"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Trade } from "@/components/dashboard/recent-trades/types"
import { TradeDetailDialog } from "@/components/dashboard/recent-trades/trade-detail-dialog"
import { TradesToolbar } from "./trades-toolbar"
import { TradesGrid } from "./trades-grid"
import { TradesPagination } from "./trades-pagination"
import { TradesStats } from "./trades-stats"
import { useTrades } from "./use-trades"

export function TradesExplorer() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState("tradeDt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [side, setSide] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(24)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page on filter changes
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, sortBy, sortDir, side, pageSize])

  const { data, isLoading, isFetching } = useTrades({
    limit: pageSize,
    offset: page * pageSize,
    search: debouncedSearch,
    sortBy,
    sortDir,
    side,
  })

  const trades = data?.rows ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  const handleSortDirToggle = useCallback(() => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
  }, [])

  return (
    <>
      <Card>
        <CardContent className="pt-5">
          <TradesToolbar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDir={sortDir}
            onSortDirToggle={handleSortDirToggle}
            side={side}
            onSideChange={setSide}
            total={total}
            isLoading={isLoading}
          />

          <div className="mt-4">
            <TradesStats trades={trades} isLoading={isLoading} />
          </div>

          <Separator className="my-4" />

          <TradesGrid
            trades={trades}
            isLoading={isLoading && trades.length === 0}
            onClick={setSelectedTrade}
          />

          {totalPages > 0 && (
            <TradesPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      <TradeDetailDialog
        trade={selectedTrade}
        open={selectedTrade !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTrade(null)
        }}
      />
    </>
  )
}
