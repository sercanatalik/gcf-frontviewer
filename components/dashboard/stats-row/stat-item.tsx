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

const iconMap: Record<string, React.ReactNode> = {
  Copy: <Copy className="size-4" />,
  Users: <Users className="size-4" />,
  Briefcase: <Briefcase className="size-4" />,
  Coins: <Coins className="size-4" />,
  DollarSign: <DollarSign className="size-4" />,
  BookOpen: <BookOpen className="size-4" />,
  UserCheck: <UserCheck className="size-4" />,
}

interface StatItemProps {
  measure: StatMeasure
  data?: StatData
  isLoading: boolean
}

export function StatItem({ measure, data, isLoading }: StatItemProps) {
  const icon = iconMap[measure.icon]

  return (
    <div
      className="flex items-center gap-4 border bg-card px-4 py-4"
      style={{ borderLeftWidth: 3, borderLeftColor: measure.color }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: measure.color + "18", color: measure.color }}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate text-xs text-muted-foreground">
          {measure.label}
        </span>
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-xl font-semibold tabular-nums leading-tight">
                {data?.current ?? 0}
              </span>
              {(data?.delta ?? 0) > 0 ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
                  <TrendingUp className="size-2.5" />
                  +{data!.delta}
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Minus className="size-2.5" />
                  {data?.delta ?? 0}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
