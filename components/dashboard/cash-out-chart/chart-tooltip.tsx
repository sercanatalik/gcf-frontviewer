"use client"

import { formatCurrency, CHART_COLORS } from "./utils"

function ColorSquare({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <rect width="12" height="12" rx="2" fill={color} />
    </svg>
  )
}

interface PayloadItem {
  name: string
  value: number
  dataKey: string
  color?: string
  fill?: string
  payload?: Record<string, unknown>
}

interface CustomTooltipProps {
  active?: boolean
  payload?: PayloadItem[]
  label?: string
  groups: string[]
}

export function CustomTooltip({ active, payload, label, groups }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0)

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const idx = groups.indexOf(entry.dataKey)
          const color = CHART_COLORS[idx % CHART_COLORS.length]!
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <ColorSquare color={color} />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono font-medium tabular-nums">
                {formatCurrency(Number(entry.value))}
              </span>
            </div>
          )
        })}
      </div>
      {payload.length > 1 && (
        <div className="mt-1.5 flex items-center justify-between border-t border-border pt-1.5 gap-8">
          <span className="font-medium text-muted-foreground">Total</span>
          <span className="font-mono font-semibold tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      )}
    </div>
  )
}

interface CustomLegendProps {
  groups: string[]
}

export function CustomLegend({ groups }: CustomLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-2 pt-4 text-xs">
      {groups.map((group, i) => (
        <div key={group} className="flex items-center gap-2">
          <ColorSquare color={CHART_COLORS[i % CHART_COLORS.length]!} />
          <span className="text-muted-foreground">{group}</span>
        </div>
      ))}
    </div>
  )
}
