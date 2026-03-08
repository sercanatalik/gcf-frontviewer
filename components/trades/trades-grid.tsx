"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Trade } from "@/components/dashboard/recent-trades/types"
import {
  formatCurrency,
  timeAgo,
  daysUntil,
  daysUntilRaw,
  formatSpread,
} from "@/components/dashboard/recent-trades/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TradesGridProps {
  trades: Trade[]
  isLoading: boolean
  onClick: (trade: Trade) => void
}

const sideColor: Record<string, string> = {
  PAY: "bg-chart-3",
  RECEIVE: "bg-chart-1",
  REC: "bg-chart-1",
}

export function TradesGrid({ trades, isLoading, onClick }: TradesGridProps) {
  if (isLoading && trades.length === 0) {
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No trades found</p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 xl:grid-cols-3", isLoading && "opacity-60")}>
      {trades.map((trade) => (
        <TradeCard key={trade.tradeId} trade={trade} onClick={onClick} />
      ))}
    </div>
  )
}

function TradeCard({
  trade,
  onClick,
}: {
  trade: Trade
  onClick: (trade: Trade) => void
}) {
  const maturityDays = daysUntilRaw(trade.maturityDt)
  const isUrgent = maturityDays >= 0 && maturityDays <= 7
  const isExpired = maturityDays < 0

  return (
    <div
      className="group relative cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
      onClick={() => onClick(trade)}
    >
      {/* Side indicator */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full",
          sideColor[trade.side] || "bg-muted-foreground/30",
        )}
      />

      {/* Header: counterparty + amount */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{trade.counterParty}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {trade.collateralDesc}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              trade.fundingAmount >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground",
            )}
          >
            {formatCurrency(trade.fundingAmount)}
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {formatSpread(trade.fundingMargin)}
          </span>
        </div>
      </div>

      {/* Badges row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1 pl-2">
        <Badge variant="secondary" className="h-4 px-1 text-[9px] font-medium">
          {trade.productType}
        </Badge>
        {trade.side && (
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            {trade.side}
          </Badge>
        )}
        {trade.tenor && (
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            {trade.tenor}
          </Badge>
        )}
        {isUrgent && (
          <Badge
            variant="outline"
            className="h-4 border-foreground/30 px-1 text-[9px] font-bold"
          >
            {maturityDays}d
          </Badge>
        )}
        {isExpired && (
          <Badge
            variant="outline"
            className="h-4 border-foreground/30 px-1 text-[9px] font-bold"
          >
            Exp
          </Badge>
        )}
        {trade.haircut != null && trade.haircut > 0 && (
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            HC {trade.haircut.toFixed(1)}%
          </Badge>
        )}
      </div>

      {/* Footer metadata */}
      <TooltipProvider delayDuration={300}>
        <div className="mt-2.5 flex items-center gap-1.5 pl-2 text-[10px] text-muted-foreground">
          <span>{timeAgo(trade.tradeDt)}</span>
          <span className="text-border">·</span>
          <span>mat. {daysUntil(trade.maturityDt)}</span>
          <span className="text-border">·</span>
          <span>{trade.hmsDesk || "—"}</span>
          <span className="text-border">·</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {trade.fundingCurrency || "—"}/{trade.collatCurrency || "—"}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Funding / Collateral currency
            </TooltipContent>
          </Tooltip>
          {trade.cpRatingSnp && (
            <>
              <span className="text-border">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default font-medium">
                    {trade.cpRatingSnp}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  S&P Rating
                  {trade.cpRatingMoodys
                    ? ` / Moody's: ${trade.cpRatingMoodys}`
                    : ""}
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
