"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SortHeader } from "./sort-header"
import type { GroupedRow } from "./types"
import { formatCurrency, formatBps, formatNumber, calcChange, formatPercent } from "./utils"

interface ComparisonTableProps {
  data: GroupedRow[]
  groupLabel: string
  daysAgo: number
}

type SortField = "group" | "currentFunding" | "previousFunding" | "currentCollateral" | "currentSpread" | "currentTradeCount"
type SortDir = "asc" | "desc"

function ChangeCell({ current, previous, format }: { current: number; previous: number; format: (v: number) => string }) {
  const change = calcChange(current, previous)

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono text-xs">{format(current)}</span>
      {previous > 0 && (
        <span className={`flex items-center gap-0.5 text-[10px] ${
          change > 0.5 ? "text-emerald-500" :
          change < -0.5 ? "text-red-400" :
          "text-muted-foreground"
        }`}>
          {change > 0.5 ? <TrendingUp className="size-2.5" /> :
           change < -0.5 ? <TrendingDown className="size-2.5" /> :
           <Minus className="size-2.5" />}
          {formatPercent(change)}
        </span>
      )}
    </div>
  )
}

export function ComparisonTable({ data, groupLabel, daysAgo }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>("currentFunding")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === "asc"
        ? (Number(aVal) - Number(bVal))
        : (Number(bVal) - Number(aVal))
    })
  }, [data, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  // Compute totals
  const totals = useMemo(() => {
    return data.reduce(
      (acc, row) => ({
        currentFunding: acc.currentFunding + Number(row.currentFunding),
        previousFunding: acc.previousFunding + Number(row.previousFunding),
        currentCollateral: acc.currentCollateral + Number(row.currentCollateral),
        previousCollateral: acc.previousCollateral + Number(row.previousCollateral),
        currentTradeCount: acc.currentTradeCount + Number(row.currentTradeCount),
        previousTradeCount: acc.previousTradeCount + Number(row.previousTradeCount),
      }),
      { currentFunding: 0, previousFunding: 0, currentCollateral: 0, previousCollateral: 0, currentTradeCount: 0, previousTradeCount: 0 },
    )
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity by {groupLabel}</CardTitle>
        <CardDescription>
          Side-by-side comparison across {data.length} groups
        </CardDescription>
        <CardAction>
          <Badge variant="outline" className="font-mono text-[10px]">
            {data.length} rows
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[460px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 z-10 bg-muted/50">
                  <SortHeader onSort={toggleSort} field="group">{groupLabel}</SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader onSort={toggleSort} field="currentFunding">Funding</SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader onSort={toggleSort} field="currentCollateral">Collateral</SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader onSort={toggleSort} field="currentSpread">Avg Spread</SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader onSort={toggleSort} field="currentTradeCount">Trades</SortHeader>
                </TableHead>
                <TableHead className="text-right text-muted-foreground/60">
                  Prev Funding
                </TableHead>
                <TableHead className="text-right text-muted-foreground/60">
                  Prev Collateral
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => {
                const fundingChange = calcChange(Number(row.currentFunding), Number(row.previousFunding))
                const isNew = Number(row.previousFunding) === 0 && Number(row.currentFunding) > 0
                const isGone = Number(row.currentFunding) === 0 && Number(row.previousFunding) > 0

                return (
                  <TableRow key={row.group} className={isNew ? "bg-emerald-500/5" : isGone ? "bg-red-500/5" : ""}>
                    <TableCell className="sticky left-0 z-10 bg-card font-medium">
                      <div className="flex items-center gap-2">
                        <span className="max-w-40 truncate">{row.group || "(blank)"}</span>
                        {isNew && (
                          <Badge variant="outline" className="text-[9px] text-emerald-500">
                            NEW
                          </Badge>
                        )}
                        {isGone && (
                          <Badge variant="destructive" className="text-[9px]">
                            EXITED
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell
                        current={Number(row.currentFunding)}
                        previous={Number(row.previousFunding)}
                        format={formatCurrency}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell
                        current={Number(row.currentCollateral)}
                        previous={Number(row.previousCollateral)}
                        format={formatCurrency}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell
                        current={Number(row.currentSpread)}
                        previous={Number(row.previousSpread)}
                        format={formatBps}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell
                        current={Number(row.currentTradeCount)}
                        previous={Number(row.previousTradeCount)}
                        format={formatNumber}
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatCurrency(Number(row.previousFunding))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatCurrency(Number(row.previousCollateral))}
                    </TableCell>
                  </TableRow>
                )
              })}
              {/* Totals row */}
              <TableRow className="border-t-2 bg-muted/30 font-semibold">
                <TableCell className="sticky left-0 z-10 bg-muted/30">Total</TableCell>
                <TableCell className="text-right">
                  <ChangeCell current={totals.currentFunding} previous={totals.previousFunding} format={formatCurrency} />
                </TableCell>
                <TableCell className="text-right">
                  <ChangeCell current={totals.currentCollateral} previous={totals.previousCollateral} format={formatCurrency} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">-</TableCell>
                <TableCell className="text-right">
                  <ChangeCell current={totals.currentTradeCount} previous={totals.previousTradeCount} format={formatNumber} />
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatCurrency(totals.previousFunding)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatCurrency(totals.previousCollateral)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
