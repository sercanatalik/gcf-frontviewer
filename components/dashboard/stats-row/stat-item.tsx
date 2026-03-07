"use client"

import {
  Copy,
  Users,
  Briefcase,
  Coins,
  DollarSign,
  BookOpen,
  UserCheck,
  TrendingUp,
  Minus,
  Loader2,
} from "lucide-react"
import type { StatMeasure, StatData } from "./types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Copy,
  Users,
  Briefcase,
  Coins,
  DollarSign,
  BookOpen,
  UserCheck,
}

interface StatItemProps {
  measure: StatMeasure
  data?: StatData
  isLoading: boolean
}

export function StatItem({ measure, data, isLoading }: StatItemProps) {
  const Icon = iconMap[measure.icon]

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: measure.color + "14", color: measure.color }}
      >
        {Icon && <Icon className="size-3.5" />}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
          {measure.label}
        </span>
        {isLoading ? (
          <Loader2 className="mt-0.5 size-4 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tabular-nums leading-tight">
              {data?.current ?? 0}
            </span>
            {(data?.delta ?? 0) > 0 ? (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-500">
                <TrendingUp className="size-2.5" />
                +{data!.delta}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                <Minus className="size-2.5" />
                {data?.delta ?? 0}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
