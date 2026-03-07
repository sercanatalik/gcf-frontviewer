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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  CircleDollarSign,
  CreditCard,
  FileText,
  Globe,
  Hash,
  Landmark,
  Layers,
  MapPin,
  Percent,
  Scale,
  Shield,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trade } from "./types"
import { getInitials, formatCurrency, formatSpread, daysUntilRaw } from "./utils"

interface TradeDetailDialogProps {
  trade: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNum(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "N/A"
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatPct(value: number | null | undefined): string {
  if (value == null) return "N/A"
  return `${(value * 100).toFixed(2)}%`
}

function val(v: string | number | null | undefined): string {
  if (v == null || v === "") return "N/A"
  return String(v)
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
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h4>
  )
}

export function TradeDetailDialog({ trade, open, onOpenChange }: TradeDetailDialogProps) {
  if (!trade) return null

  const maturityDays = daysUntilRaw(trade.maturityDt)
  const isUrgent = maturityDays >= 0 && maturityDays <= 7
  const totalDays = Math.ceil(
    (new Date(trade.maturityDt).getTime() - new Date(trade.startDt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const elapsed = Math.ceil(
    (new Date().getTime() - new Date(trade.startDt).getTime()) / (1000 * 60 * 60 * 24),
  )
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsed / totalDays) * 100)) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-5xl overflow-y-auto p-0">
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <Avatar className="size-11">
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(trade.counterParty)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg">{trade.counterParty}</DialogTitle>
                <DialogDescription className="mt-0.5 flex items-center gap-2 font-mono text-xs">
                  <span className="truncate">{trade.collateralDesc}</span>
                  <span className="text-border">•</span>
                  <span className="shrink-0 text-muted-foreground">ID: {trade.tradeId}</span>
                </DialogDescription>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{trade.productType}</Badge>
                {trade.productSubType && (
                  <Badge variant="secondary" className="text-[10px]">{trade.productSubType}</Badge>
                )}
                {trade.side && <Badge variant="outline">{trade.side}</Badge>}
                {trade.tradeStatus && <Badge variant="outline">{trade.tradeStatus}</Badge>}
                {trade.maturityIsOpen === 1 && <Badge variant="outline">Open</Badge>}
                {isUrgent && (
                  <Badge variant="outline" className="border-foreground/30 font-bold">{maturityDays}d left</Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* KPI strip */}
          <div className="mt-4 grid grid-cols-6 gap-3">
            <KpiCard
              label="Funding"
              value={formatCurrency(trade.fundingAmount)}
              className={trade.fundingAmount >= 0 ? "text-foreground" : "text-muted-foreground"}
            />
            <KpiCard label="Collateral" value={formatCurrency(trade.collateralAmount)} />
            <KpiCard label="Exposure" value={formatCurrency(trade.financingExposure)} />
            <KpiCard label="Margin" value={formatSpread(trade.fundingMargin)} />
            <KpiCard label="Haircut" value={formatPct(trade.haircut)} />
            <KpiCard
              label="Maturity"
              value={maturityDays > 0 ? `${maturityDays}d` : maturityDays === 0 ? "Today" : "Expired"}
              className={cn(isUrgent && "text-foreground font-black")}
            />
          </div>
        </div>

        {/* Timeline progress bar */}
        <div className="px-6 pt-4">
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Start: <span className="font-medium text-foreground">{formatDate(trade.startDt)}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {trade.tenor && `Tenor: ${trade.tenor}`}
                {trade.tenor && trade.dtm != null && " • "}
                {trade.dtm != null && `DTM: ${trade.dtm}d`}
                {(trade.tenor || trade.dtm != null) && trade.age != null && " • "}
                {trade.age != null && `Age: ${trade.age}d`}
              </span>
              <span className="text-muted-foreground">
                Maturity: <span className={cn("font-medium", isUrgent ? "text-foreground font-bold" : "text-foreground")}>
                  {formatDate(trade.maturityDt)}
                </span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isUrgent ? "bg-foreground" : "bg-primary",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{elapsed}d elapsed</span>
              <span>{totalDays}d total</span>
            </div>
          </div>
        </div>

        {/* Tabbed details */}
        <div className="px-6 pt-2 pb-5">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="collateral">Collateral</TabsTrigger>
              <TabsTrigger value="funding">Funding & Risk</TabsTrigger>
              <TabsTrigger value="book">Book & Trading</TabsTrigger>
            </TabsList>

            {/* --- Overview Tab --- */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Instrument" />
                  <InfoItem icon={ArrowRightLeft} label="Product Type" value={val(trade.productType)} />
                  <InfoItem icon={Layers} label="Sub Type" value={val(trade.productSubType)} />
                  <InfoItem icon={BarChart3} label="Asset Class" value={val(trade.assetClass)} />
                  <InfoItem icon={Landmark} label="Collateral Type" value={val(trade.collateralType)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Counterparty" />
                  <InfoItem icon={Building2} label="Name" value={val(trade.counterParty)} />
                  <InfoItem icon={User} label="Parent" value={val(trade.counterpartyParentName)} />
                  <InfoItem icon={Globe} label="Type" value={val(trade.cpType)} />
                  <InfoItem icon={MapPin} label="Country of Risk" value={val(trade.countryOfRisk)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Ratings" />
                  <InfoItem icon={ShieldCheck} label="S&P" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cpRatingSnp)}</Badge>
                  } />
                  <InfoItem icon={ShieldCheck} label="Moody's" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cpRatingMoodys)}</Badge>
                  } />
                  <InfoItem icon={Shield} label="CRR" value={val(trade.cpCrr)} />
                  <InfoItem icon={MapPin} label="Domicile" value={val(trade.domicileCountry)} />
                </div>
              </div>

              {/* Timeline dates */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                <DateCard label="As of Date" date={trade.asofDate} />
                <DateCard label="Trade Date" date={trade.tradeDt} />
                <DateCard label="Start Date" date={trade.startDt} />
                <DateCard label="Maturity Date" date={trade.maturityDt} urgent={isUrgent} />
              </div>
            </TabsContent>

            {/* --- Collateral Tab --- */}
            <TabsContent value="collateral" className="mt-4">
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Security Details" />
                  <InfoItem icon={FileText} label="Description" value={val(trade.collateralDesc)} />
                  <InfoItem icon={Landmark} label="Collateral Name" value={val(trade.collatName)} />
                  <InfoItem icon={Layers} label="Collateral Type" value={val(trade.collateralType)} />
                  <InfoItem icon={BarChart3} label="Instrument Type" value={val(trade.instrumentType)} />
                  <InfoItem icon={Building2} label="Issuer" value={val(trade.issuerName)} />
                  <Separator className="my-2" />
                  <InfoItem icon={Percent} label="Coupon" value={trade.coupon != null ? `${trade.coupon}%` : "N/A"} />
                  <InfoItem icon={Layers} label="Coupon Type" value={val(trade.couponType)} />
                  <InfoItem icon={CalendarClock} label="Instrument Maturity" value={formatDate(trade.instrumentMaturityDt)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Identifiers & Currency" />
                  <InfoItem icon={Hash} label="ISIN" value={
                    <span className="font-mono text-xs">{val(trade.isinId)}</span>
                  } />
                  <InfoItem icon={Hash} label="BBG ID" value={
                    <span className="font-mono text-xs">{val(trade.bbgId)}</span>
                  } />
                  <InfoItem icon={Hash} label="Ticker" value={
                    <span className="font-mono text-xs">{val(trade.ticker)}</span>
                  } />
                  <Separator className="my-2" />
                  <InfoItem icon={CreditCard} label="Collateral CCY" value={val(trade.collatCurrency)} />
                  <InfoItem icon={CreditCard} label="Instrument CCY" value={val(trade.instrumentCcy)} />
                  <Separator className="my-2" />
                  <SectionHeader title="Amounts" />
                  <InfoItem icon={Wallet} label="Collateral Amount" value={formatCurrency(trade.collateralAmount)} />
                  <InfoItem icon={Wallet} label="Collateral (LCY)" value={formatCurrency(trade.collateralAmountLCY)} />
                </div>
              </div>
            </TabsContent>

            {/* --- Funding & Risk Tab --- */}
            <TabsContent value="funding" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Funding Terms" />
                  <InfoItem icon={Banknote} label="Funding Type" value={val(trade.fundingType)} />
                  <InfoItem icon={CreditCard} label="Funding CCY" value={val(trade.fundingCurrency)} />
                  <InfoItem icon={Percent} label="Margin" value={formatSpread(trade.fundingMargin)} />
                  <InfoItem icon={Percent} label="Fixed Rate" value={trade.fixedRate != null ? `${trade.fixedRate.toFixed(4)}%` : "N/A"} />
                  <InfoItem icon={FileText} label="Fixing Label" value={val(trade.fundingFixingLabel)} />
                  <InfoItem icon={Scale} label="Haircut" value={formatPct(trade.haircut)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Amounts" />
                  <InfoItem icon={Wallet} label="Funding" value={
                    <span className={trade.fundingAmount >= 0
                      ? "text-foreground"
                      : "text-muted-foreground"
                    }>{formatCurrency(trade.fundingAmount)}</span>
                  } />
                  <InfoItem icon={Wallet} label="Funding (LCY)" value={formatCurrency(trade.fundingAmountLCY)} />
                  <InfoItem icon={TrendingUp} label="Exposure" value={formatCurrency(trade.financingExposure)} />
                  <InfoItem icon={CircleDollarSign} label="Cash Out" value={formatCurrency(trade.cashOut)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Risk & Accruals" />
                  <InfoItem icon={TrendingUp} label="Margin Call (Realised)" value={formatCurrency(trade.realisedMarginCall)} />
                  <InfoItem icon={TrendingUp} label="Margin Call (Expected)" value={formatCurrency(trade.expectedMarginCall)} />
                  <Separator className="my-2" />
                  <InfoItem icon={CircleDollarSign} label="Daily Accrual" value={formatNum(trade.accrualDaily)} />
                  <InfoItem icon={CircleDollarSign} label="Projected Accrual" value={formatNum(trade.accrualProjected)} />
                  <InfoItem icon={CircleDollarSign} label="Realised Accrual" value={formatNum(trade.accrualRealised)} />
                </div>
              </div>

              {/* FX row */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Globe className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">FX Spot</p>
                    <p className="text-sm font-medium tabular-nums">{formatNum(trade.fxSpot, 4)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Globe className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">FX Pair</p>
                    <p className="text-sm font-medium">{val(trade.fxPair)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Globe className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">FX Pair (Funding)</p>
                    <p className="text-sm font-medium">{val(trade.fxPairFunding)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- Book & Trading Tab --- */}
            <TabsContent value="book" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Desk Hierarchy" />
                  <InfoItem icon={Banknote} label="Desk" value={val(trade.hmsDesk)} />
                  <InfoItem icon={BookOpen} label="Book" value={val(trade.hmsBook)} />
                  <InfoItem icon={Layers} label="Portfolio" value={val(trade.hmsPortfolio)} />
                  <InfoItem icon={BarChart3} label="SL1" value={val(trade.hmsSL1)} />
                  <InfoItem icon={BarChart3} label="SL2" value={val(trade.hmsSL2)} />
                  <InfoItem icon={Layers} label="Book Category" value={val(trade.bookCategory)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Trading" />
                  <InfoItem icon={User} label="Trader" value={val(trade.primaryTrader)} />
                  <InfoItem icon={MapPin} label="Location" value={val(trade.tradingLocation)} />
                  <InfoItem icon={Globe} label="Region" value={val(trade.region)} />
                  <InfoItem icon={Globe} label="Sub Region" value={val(trade.subRegion)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Legal Entity" />
                  <InfoItem icon={Building2} label="LE Name" value={val(trade.leName)} />
                  <InfoItem icon={Hash} label="CP LEI" value={
                    <span className="font-mono text-xs">{val(trade.counterpartyLei)}</span>
                  } />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function KpiCard({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-lg font-bold tabular-nums", className)}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function DateCard({
  label,
  date,
  urgent,
}: {
  label: string
  date: string
  urgent?: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border p-3",
      urgent && "border-foreground/20 bg-muted",
    )}>
      <CalendarClock className={cn("size-4", urgent ? "text-foreground" : "text-muted-foreground")} />
      <div>
        <p className={cn("text-[11px]", urgent ? "text-foreground/70" : "text-muted-foreground")}>{label}</p>
        <p className={cn("text-sm font-medium tabular-nums", urgent && "text-foreground font-bold")}>{formatDate(date)}</p>
      </div>
    </div>
  )
}
