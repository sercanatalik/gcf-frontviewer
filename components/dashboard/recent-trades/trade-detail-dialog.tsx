"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  ArrowRightLeft,
  Banknote,
  BarChart3,
  BookOpen,
  Building2,
  CalendarClock,
  Globe,
  Landmark,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trade } from "./types"
import { getInitials, formatCurrency, formatSpread, daysUntilRaw } from "./utils"

interface TradeDetailDialogProps {
  trade: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function TradeDetailDialog({ trade, open, onOpenChange }: TradeDetailDialogProps) {
  if (!trade) return null

  const maturityDays = daysUntilRaw(trade.maturity_dt)
  const isUrgent = maturityDays >= 0 && maturityDays <= 7
  const totalDays = Math.ceil(
    (new Date(trade.maturity_dt).getTime() - new Date(trade.start_dt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const elapsed = Math.ceil(
    (new Date().getTime() - new Date(trade.start_dt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl overflow-y-auto p-0">
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="size-11">
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(trade.counterparty_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg">{trade.counterparty_name}</DialogTitle>
                <DialogDescription className="mt-0.5 truncate font-mono text-xs">
                  {trade.collateral_desc}
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{trade.trade_type}</Badge>
                <Badge variant="outline">ACTIVE</Badge>
                {isUrgent && (
                  <Badge variant="destructive">{maturityDays}d left</Badge>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Metric cards row */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardHeader className="pb-1.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-xl font-bold tabular-nums",
                  trade.funding_amount >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}>
                  {formatCurrency(trade.funding_amount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Collateral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold tabular-nums">
                  {formatCurrency(trade.collateral_amount)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Spread
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold tabular-nums">
                  {formatSpread(trade.funding_spread)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1.5">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Maturity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-xl font-bold tabular-nums",
                  isUrgent && "text-destructive",
                )}>
                  {maturityDays > 0 ? `${maturityDays}d` : maturityDays === 0 ? "Today" : "Expired"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline progress bar */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Start: <span className="font-medium text-foreground">{formatDate(trade.start_dt)}</span>
              </span>
              <span className="text-muted-foreground">
                Maturity: <span className={cn("font-medium", isUrgent ? "text-destructive" : "text-foreground")}>
                  {formatDate(trade.maturity_dt)}
                </span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isUrgent ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{elapsed}d elapsed</span>
              <span>{totalDays}d total</span>
            </div>
          </div>

          {/* Detail grids */}
          <div className="grid grid-cols-3 gap-5">
            {/* Instrument */}
            <div className="rounded-lg border p-4">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instrument
              </h4>
              <InfoItem icon={ArrowRightLeft} label="Trade Type" value={trade.trade_type} />
              <InfoItem icon={BarChart3} label="Asset Class" value={trade.asset_class} />
              <InfoItem icon={Landmark} label="Collateral Type" value={trade.collateral_type} />
              <InfoItem icon={ShieldCheck} label="Rating" value={
                <Badge variant="secondary" className="text-[10px]">{trade.rating || "N/A"}</Badge>
              } />
            </div>

            {/* Counterparty */}
            <div className="rounded-lg border p-4">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Counterparty
              </h4>
              <InfoItem icon={Building2} label="Name" value={trade.counterparty_name} />
              <InfoItem icon={Globe} label="Type" value={trade.counterparty_type} />
              <InfoItem icon={MapPin} label="Region" value={trade.counterparty_region} />
              <InfoItem icon={MapPin} label="Country" value={trade.country} />
            </div>

            {/* Trading */}
            <div className="rounded-lg border p-4">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trading
              </h4>
              <InfoItem icon={Banknote} label="Desk" value={trade.desk} />
              <InfoItem icon={User} label="Trader" value={trade.trader_name} />
              <InfoItem icon={BookOpen} label="Book" value={trade.book_name} />
              <InfoItem icon={MapPin} label="Location" value={`${trade.city}, ${trade.book_region}`} />
            </div>
          </div>

          {/* Timeline dates row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CalendarClock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Trade Date</p>
                <p className="text-sm font-medium tabular-nums">{formatDate(trade.trade_dt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CalendarClock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium tabular-nums">{formatDate(trade.start_dt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <CalendarClock className="size-4 text-destructive" />
              <div>
                <p className="text-[11px] text-destructive/70">Maturity Date</p>
                <p className="text-sm font-medium tabular-nums text-destructive">{formatDate(trade.maturity_dt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
