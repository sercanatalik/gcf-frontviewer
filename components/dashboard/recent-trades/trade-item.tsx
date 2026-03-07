"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Trade } from "./types"
import { getInitials, formatCurrency, timeAgo, daysUntil, daysUntilRaw, formatSpread } from "./utils"

interface TradeItemProps {
  trade: Trade
  variant: "recent" | "maturing"
  onClick: (trade: Trade) => void
}

export function TradeItem({ trade, variant, onClick }: TradeItemProps) {
  const maturityDays = daysUntilRaw(trade.maturity_dt)
  const isUrgent = maturityDays >= 0 && maturityDays <= 7

  return (
    <div
      className="group flex cursor-pointer items-start gap-3 border-b px-1 py-3 transition-colors last:border-b-0 hover:bg-muted/50"
      onClick={() => onClick(trade)}
    >
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback className="text-[10px]">
          {getInitials(trade.counterparty_name) || "--"}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium">{trade.counterparty_name}</span>
          {variant === "maturing" && isUrgent && (
            <Badge variant="destructive" className="h-4 px-1 text-[10px]">
              {maturityDays}d
            </Badge>
          )}
        </div>
        <span className="truncate text-[11px] text-muted-foreground">
          {trade.collateral_desc} - {trade.trade_type}
        </span>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {variant === "recent" ? (
            <>
              <span>{timeAgo(trade.trade_dt)}</span>
              <span className="text-border">|</span>
              <span>mat. {daysUntil(trade.maturity_dt)}</span>
            </>
          ) : (
            <>
              <span>Matures {daysUntil(trade.maturity_dt)}</span>
              <span className="text-border">|</span>
              <span>{formatSpread(trade.funding_spread)}</span>
            </>
          )}
        </div>
      </div>

      <div className={cn(
        "shrink-0 text-right text-xs tabular-nums",
        trade.funding_amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
      )}>
        {formatCurrency(trade.funding_amount)}
      </div>
    </div>
  )
}
