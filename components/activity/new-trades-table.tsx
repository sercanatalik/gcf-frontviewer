"use client"

import { useState, useMemo } from "react"
import { LogIn } from "lucide-react"
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
import type { NewTrade } from "./types"
import { formatCurrency, formatBps } from "./utils"

type SortField = "fundingAmount" | "collateralAmount" | "cashOut" | "fundingMargin" | "counterParty" | "tradeDt"
type SortDir = "asc" | "desc"

interface NewTradesTableProps {
  data: NewTrade[]
  daysAgo: number
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

  const totals = useMemo(() => {
    return data.reduce(
      (acc, t) => ({
        fundingAmount: acc.fundingAmount + Number(t.fundingAmount),
        collateralAmount: acc.collateralAmount + Number(t.collateralAmount),
        cashOut: acc.cashOut + Number(t.cashOut),
      }),
      { fundingAmount: 0, collateralAmount: 0, cashOut: 0 },
    )
  }, [data])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10">
            <LogIn className="size-4 text-emerald-500" />
          </div>
          <div>
            <CardTitle>New Trades</CardTitle>
            <CardDescription>
              Booked since previous snapshot ({daysAgo}d ago)
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="outline" className="font-mono text-[10px]">
            {data.length} trades
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-24">Trade ID</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">
                  <SortHeader field="fundingAmount" active={sortField === "fundingAmount"} onSort={handleSort}>
                    Funding
                  </SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader field="collateralAmount" active={sortField === "collateralAmount"} onSort={handleSort}>
                    Collateral
                  </SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader field="cashOut" active={sortField === "cashOut"} onSort={handleSort}>
                    Cash Out
                  </SortHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortHeader field="fundingMargin" active={sortField === "fundingMargin"} onSort={handleSort}>
                    Spread
                  </SortHeader>
                </TableHead>
                <TableHead>Desk</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>
                  <SortHeader field="tradeDt" active={sortField === "tradeDt"} onSort={handleSort}>
                    Trade Dt
                  </SortHeader>
                </TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead>Ccy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-8 text-center text-sm text-muted-foreground">
                    No new trades in this period
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sorted.map((trade) => (
                    <TableRow key={trade.tradeId} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{trade.tradeId}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs" title={trade.counterParty}>
                        {trade.counterParty}
                      </TableCell>
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
                      <TableCell className="text-xs">{trade.hms_region}</TableCell>
                      <TableCell className="font-mono text-xs">{trade.tradeDt}</TableCell>
                      <TableCell className="font-mono text-xs">{trade.maturityDt}</TableCell>
                      <TableCell className="text-xs">{trade.fundingCurrency}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="border-t-2 bg-muted/30 font-semibold">
                    <TableCell colSpan={4} className="text-xs">Total</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(totals.fundingAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(totals.collateralAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatCurrency(totals.cashOut)}
                    </TableCell>
                    <TableCell colSpan={6} />
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
