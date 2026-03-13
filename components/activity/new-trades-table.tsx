"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import type { NewTrade } from "./types"
import { formatCurrency, formatBps } from "./utils"

type SortField = "fundingAmount" | "collateralAmount" | "cashOut" | "fundingMargin" | "counterParty" | "tradeDt"
type SortDir = "asc" | "desc"

interface NewTradesTableProps {
  data: NewTrade[]
  daysAgo: number
}

function SortableHeader({
  children,
  field,
  onSort,
}: {
  children: React.ReactNode
  field: SortField
  onSort: (f: SortField) => void
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="size-3 text-muted-foreground/50" />
    </button>
  )
}

export function NewTradesTable({ data, daysAgo }: NewTradesTableProps) {
  const [sortField, setSortField] = useState<SortField>("fundingAmount")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === "asc" ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal))
    })
  }, [data, sortField, sortDir])

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Trades</CardTitle>
        <CardDescription>
          {data.length} trades present in current period but not {daysAgo}d ago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Trade ID</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">
                  <SortableHeader field="fundingAmount" onSort={handleSort}>
                    Funding
                  </SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader field="collateralAmount" onSort={handleSort}>
                    Collateral
                  </SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader field="cashOut" onSort={handleSort}>
                    Cash Out
                  </SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader field="fundingMargin" onSort={handleSort}>
                    Spread
                  </SortableHeader>
                </TableHead>
                <TableHead>Desk</TableHead>
                <TableHead>
                  <SortableHeader field="tradeDt" onSort={handleSort}>
                    Trade Date
                  </SortableHeader>
                </TableHead>
                <TableHead>Maturity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                    No new trades in this period
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((trade) => (
                  <TableRow key={trade.tradeId}>
                    <TableCell className="font-mono text-xs">{trade.tradeId}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs">{trade.counterParty}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{trade.productType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={trade.side === "PAY" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(Number(trade.fundingAmount))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(Number(trade.collateralAmount))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(Number(trade.cashOut))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatBps(Number(trade.fundingMargin))}
                    </TableCell>
                    <TableCell className="text-xs">{trade.hmsDesk}</TableCell>
                    <TableCell className="font-mono text-xs">{trade.tradeDt}</TableCell>
                    <TableCell className="font-mono text-xs">{trade.maturityDt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
