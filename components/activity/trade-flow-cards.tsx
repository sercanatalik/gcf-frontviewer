"use client"

import { ArrowRightLeft, LogIn, LogOut, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { TradeFlow } from "./types"
import { formatNumber } from "./utils"

interface TradeFlowCardsProps {
  tradeFlow: TradeFlow
  daysAgo: number
}

export function TradeFlowCards({ tradeFlow, daysAgo }: TradeFlowCardsProps) {
  const items = [
    {
      label: "New Trades",
      description: "Booked since previous snapshot",
      value: tradeFlow.newTrades,
      icon: LogIn,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      label: "Matured Trades",
      description: "Exited since previous snapshot",
      value: tradeFlow.maturedTrades,
      icon: LogOut,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10 dark:bg-red-500/15",
    },
    {
      label: "Rolled / Continuing",
      description: "Present in both snapshots",
      value: tradeFlow.rolledTrades,
      icon: RefreshCw,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/15",
    },
    {
      label: "Net Change",
      description: `${daysAgo}-day trade count delta`,
      value: tradeFlow.totalCurrent - tradeFlow.totalPrevious,
      icon: ArrowRightLeft,
      color: tradeFlow.totalCurrent >= tradeFlow.totalPrevious
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      bg: tradeFlow.totalCurrent >= tradeFlow.totalPrevious
        ? "bg-emerald-500/10 dark:bg-emerald-500/15"
        : "bg-red-500/10 dark:bg-red-500/15",
    },
  ]

  // Compute bar widths for visual flow
  const maxVal = Math.max(tradeFlow.newTrades, tradeFlow.maturedTrades, tradeFlow.rolledTrades, 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Activity Flow</CardTitle>
        <CardDescription>
          Trade lifecycle changes over {daysAgo} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1.5 ${item.bg}`}>
                    <Icon className={`size-4 ${item.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <div className={`font-mono text-2xl font-bold tracking-tight ${item.color}`}>
                  {item.label === "Net Change" && item.value > 0 ? "+" : ""}
                  {formatNumber(item.value)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {item.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Visual flow bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-28 shrink-0 text-right">New</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500/70 transition-all"
                style={{ width: `${(tradeFlow.newTrades / maxVal) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 font-mono">{formatNumber(tradeFlow.newTrades)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-28 shrink-0 text-right">Matured</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-red-500/70 transition-all"
                style={{ width: `${(tradeFlow.maturedTrades / maxVal) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 font-mono">{formatNumber(tradeFlow.maturedTrades)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-28 shrink-0 text-right">Continuing</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500/70 transition-all"
                style={{ width: `${(tradeFlow.rolledTrades / maxVal) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 font-mono">{formatNumber(tradeFlow.rolledTrades)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
