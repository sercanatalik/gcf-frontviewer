"use client"

import { trendCards } from "./data"
import { TrendCard } from "./trend-card"

export function TrendsGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {trendCards.map((card) => (
        <TrendCard key={card.id} card={card} />
      ))}
    </div>
  )
}
