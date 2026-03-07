"use client"

import { type ColumnDef } from "@tanstack/react-table"
import type { TabRow } from "./use-bottom-tabs-data"

function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function createColumns(groupLabel: string): ColumnDef<TabRow>[] {
  return [
    {
      accessorKey: "group",
      header: groupLabel,
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("group")}</span>
      ),
    },
    {
      accessorKey: "trades",
      header: "Trades",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {(row.getValue<number>("trades")).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "cash_out",
      header: "Cash Out",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.getValue<number>("cash_out"))}
        </span>
      ),
    },
    {
      accessorKey: "funding_amount",
      header: "Funding",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.getValue<number>("funding_amount"))}
        </span>
      ),
    },
    {
      accessorKey: "collateral_amount",
      header: "Collateral",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.getValue<number>("collateral_amount"))}
        </span>
      ),
    },
    {
      accessorKey: "avg_spread",
      header: "Avg Spread",
      cell: ({ row }) => {
        const val = row.getValue<number | null>("avg_spread")
        return (
          <span className="tabular-nums">
            {val != null ? `${val.toFixed(2)}bp` : "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "avg_dtm",
      header: "Avg DTM",
      cell: ({ row }) => {
        const val = row.getValue<number | null>("avg_dtm")
        return (
          <span className="tabular-nums">
            {val != null ? `${Math.round(val)}d` : "—"}
          </span>
        )
      },
    },
  ]
}
