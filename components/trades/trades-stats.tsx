"use client"

import { useMemo } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Percent,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trade } from "@/components/dashboard/recent-trades/types"
import { Skeleton } from "@/components/ui/skeleton"

interface TradesStatsProps {
  trades: Trade[]
  isLoading: boolean
}

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : "+"
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function TradesStats({ trades, isLoading }: TradesStatsProps) {
  const stats = useMemo(() => {
    const totalFunding = trades.reduce((s, t) => s + (t.fundingAmount || 0), 0)
    const totalCollateral = trades.reduce(
      (s, t) => s + (t.collateralAmount || 0),
      0,
    )
    const totalExposure = trades.reduce(
      (s, t) => s + (t.financingExposure || 0),
      0,
    )
    const counterparties = new Set(trades.map((t) => t.counterParty)).size
    const desks = new Set(trades.map((t) => t.hmsDesk)).size
    const margins = trades.filter((t) => t.fundingMargin != null)
    const avgMargin =
      margins.length > 0
        ? margins.reduce((s, t) => s + t.fundingMargin, 0) / margins.length
        : null
    const rates = trades.filter((t) => t.fixedRate != null)
    const avgFixedRate =
      rates.length > 0
        ? rates.reduce((s, t) => s + t.fixedRate, 0) / rates.length
        : null
    const payCount = trades.filter((t) => t.side === "PAY").length
    const recCount = trades.filter(
      (t) => t.side === "RECEIVE" || t.side === "REC",
    ).length

    return {
      totalFunding,
      totalCollateral,
      totalExposure,
      counterparties,
      desks,
      avgMargin,
      avgFixedRate,
      payCount,
      recCount,
    }
  }, [trades])

  if (isLoading && trades.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      <StatCard
        label="Net Funding"
        value={formatCompact(stats.totalFunding)}
        icon={stats.totalFunding >= 0 ? ArrowUpRight : ArrowDownRight}
        color={
          stats.totalFunding >= 0 ? "text-foreground" : "text-muted-foreground"
        }
      />
      <StatCard
        label="Collateral"
        value={formatCompact(stats.totalCollateral)}
        icon={Banknote}
      />
      <StatCard
        label="Exposure"
        value={formatCompact(stats.totalExposure)}
        icon={TrendingUp}
      />
      <StatCard
        label="Counterparties"
        value={String(stats.counterparties)}
        icon={Users}
      />
      <StatCard label="Desks" value={String(stats.desks)} icon={BookOpen} />
      <StatCard
        label="Avg Margin"
        value={stats.avgMargin != null ? `${stats.avgMargin.toFixed(2)}bp` : "—"}
        icon={Percent}
      />
      <StatCard
        label="Avg Fixed Rate"
        value={stats.avgFixedRate != null ? `${stats.avgFixedRate.toFixed(2)}%` : "—"}
        icon={Percent}
      />
      <StatCard
        label="PAY / REC"
        value={`${stats.payCount} / ${stats.recCount}`}
      />
      <StatCard
        label="PAY Ratio"
        value={
          stats.payCount + stats.recCount > 0
            ? `${((stats.payCount / (stats.payCount + stats.recCount)) * 100).toFixed(0)}%`
            : "—"
        }
      />
    </div>
  )
}

function StatCard({
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
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-1">
        {Icon && (
          <Icon className={cn("size-3", color || "text-muted-foreground")} />
        )}
        <span className={cn("text-xs font-semibold tabular-nums", color)}>
          {value}
        </span>
      </div>
    </div>
  )
}
