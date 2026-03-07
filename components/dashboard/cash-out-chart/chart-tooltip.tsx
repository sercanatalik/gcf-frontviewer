"use client"

import { formatCurrency, getGroupColor } from "./utils"

interface PayloadItem {
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: PayloadItem[]
  label?: string
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)

  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={entry.name} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: entry.color || getGroupColor(i) }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
      {payload.length > 1 && (
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
          <span className="text-xs font-medium text-muted-foreground">Total</span>
          <span className="text-xs font-bold tabular-nums">{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  )
}
