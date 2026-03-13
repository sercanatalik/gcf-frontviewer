"use client"

import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Users,
  BookOpen,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PeriodTotals } from "./types"
import { formatCurrency, formatBps, formatNumber, formatPercent, calcChange } from "./utils"

interface SummaryCardsProps {
  current: PeriodTotals
  previous: PeriodTotals
  daysAgo: number
}

function TrendIndicator({ change }: { change: number }) {
  if (Math.abs(change) < 0.01) {
    return (
      <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
        <Minus className="size-3" />
        0.0%
      </Badge>
    )
  }
  if (change > 0) {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500/15 font-mono text-[10px] text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
        <TrendingUp className="size-3" />
        {formatPercent(change)}
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="gap-1 font-mono text-[10px]">
      <TrendingDown className="size-3" />
      {formatPercent(change)}
    </Badge>
  )
}

const metrics = [
  {
    key: "totalFunding",
    label: "Funding Amount",
    icon: DollarSign,
    format: formatCurrency,
    color: "oklch(0.62 0.17 255)",
  },
  {
    key: "totalCollateral",
    label: "Collateral Amount",
    icon: BarChart3,
    format: formatCurrency,
    color: "oklch(0.55 0.20 260)",
  },
  {
    key: "avgSpread",
    label: "Avg Spread",
    icon: Activity,
    format: formatBps,
    color: "oklch(0.60 0.16 170)",
  },
  {
    key: "tradeCount",
    label: "Total Trades",
    icon: BookOpen,
    format: formatNumber,
    color: "oklch(0.65 0.15 50)",
  },
  {
    key: "clientCount",
    label: "Clients",
    icon: Users,
    format: formatNumber,
    color: "oklch(0.58 0.18 300)",
  },
  {
    key: "bookCount",
    label: "Books",
    icon: BookOpen,
    format: formatNumber,
    color: "oklch(0.55 0.15 230)",
  },
] as const

export function SummaryCards({ current, previous, daysAgo }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => {
        const curVal = Number((current as unknown as Record<string, unknown>)[m.key]) || 0
        const prevVal = Number((previous as unknown as Record<string, unknown>)[m.key]) || 0
        const change = calcChange(curVal, prevVal)
        const Icon = m.icon

        return (
          <Card key={m.key} size="sm">
            <CardHeader className="flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {m.label}
              </CardTitle>
              <Icon className="size-3.5 text-muted-foreground" style={{ color: m.color }} />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="font-mono text-lg font-semibold tracking-tight">
                {m.format(curVal)}
              </div>
              <div className="flex items-center gap-2">
                <TrendIndicator change={change} />
                <span className="text-[10px] text-muted-foreground">
                  vs {daysAgo}d ago
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                was {m.format(prevVal)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
