"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Trade } from "./types"
import { formatCurrency, timeAgo, daysUntil, daysUntilRaw, formatSpread } from "./utils"

interface TradeItemProps {
  trade: Trade
  variant: "recent" | "maturing"
  onClick: (trade: Trade) => void
}

const sideColor: Record<string, string> = {
  PAY: "bg-chart-3",
  RECEIVE: "bg-chart-1",
  REC: "bg-chart-1",
}

export function TradeItem({ trade, variant, onClick }: TradeItemProps) {
  const maturityDays = daysUntilRaw(trade.maturityDt)
  const isUrgent = maturityDays >= 0 && maturityDays <= 7
  const isExpired = maturityDays < 0

  return (
    <div
      className="group relative flex cursor-pointer items-start gap-3 border-b px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/50"
      onClick={() => onClick(trade)}
    >
      {/* Side indicator bar */}
      <div className={cn(
        "absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full",
        sideColor[trade.side] || "bg-muted-foreground/30",
      )} />

     

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Row 1: counterparty + badges */}
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold">{trade.counterParty}</span>
          <Badge variant="secondary" className="h-4 shrink-0 px-1 text-[9px] font-medium">
            {trade.productType}
          </Badge>
          {trade.side && (
            <Badge variant="outline" className="h-4 shrink-0 px-1 text-[9px]">
              {trade.side}
            </Badge>
          )}
          {variant === "maturing" && isUrgent && (
            <Badge variant="outline" className="h-4 shrink-0 border-foreground/30 px-1 text-[9px] font-bold">
              {maturityDays}d
            </Badge>
          )}
          {isExpired && (
            <Badge variant="outline" className="h-4 shrink-0 border-foreground/30 px-1 text-[9px] font-bold">
              Exp
            </Badge>
          )}
        </div>

        {/* Row 2: collateral description + ticker */}
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[11px] text-muted-foreground">
            {trade.collateralDesc}
          </span>
          {trade.ticker && (
            <span className="shrink-0 rounded bg-muted px-1 py-px font-mono text-[9px] text-muted-foreground">
              {trade.ticker}
            </span>
          )}
        </div>

        {/* Row 3: metadata chips */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <TooltipProvider delayDuration={300}>
            {variant === "recent" ? (
              <>
                <span>{timeAgo(trade.tradeDt)}</span>
                <span className="text-border">·</span>
                <span>mat. {daysUntil(trade.maturityDt)}</span>
              </>
            ) : (
              <>
                <span>Matures {daysUntil(trade.maturityDt)}</span>
                {trade.tenor && (
                  <>
                    <span className="text-border">·</span>
                    <span>{trade.tenor}</span>
                  </>
                )}
              </>
            )}
            <span className="text-border">·</span>
            <span>{trade.hmsDesk || "—"}</span>
            <span className="text-border">·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">{trade.fundingCurrency || "—"}/{trade.collatCurrency || "—"}</span>
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
                    <span className="cursor-default font-medium">{trade.cpRatingSnp}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    S&P Rating{trade.cpRatingMoodys ? ` / Moody's: ${trade.cpRatingMoodys}` : ""}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      </div>

      {/* Right: amounts column */}
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={cn(
          "text-xs font-semibold tabular-nums",
          trade.fundingAmount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
        )}>
          {formatCurrency(trade.fundingAmount)}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {formatSpread(trade.fundingMargin)}
        </span>
        {trade.haircut != null && trade.haircut > 0 && (
          <span className="text-[10px] tabular-nums text-muted-foreground">
            HC {trade.haircut.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}
