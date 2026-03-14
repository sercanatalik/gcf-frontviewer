"use client"

import * as React from "react"
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
  Braces,
  Building2,
  CalendarClock,
  Check,
  CircleDollarSign,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Globe,
  Hash,
  Landmark,
  Layers,
  Loader2,
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
import { basePath } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JsonViewer } from "@/components/ui/json-viewer"
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
  const [goldeneyeData, setGoldeneyeData] = React.useState<unknown>(null)
  const [goldeneyeTradeId, setGoldeneyeTradeId] = React.useState<string | null>(null)

  // Reset goldeneye cache when trade changes
  React.useEffect(() => {
    if (trade?.tradeId !== goldeneyeTradeId) {
      setGoldeneyeData(null)
      setGoldeneyeTradeId(null)
    }
  }, [trade?.tradeId, goldeneyeTradeId])

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
          <div className="mt-4 grid grid-cols-7 gap-3">
            <KpiCard
              label="Funding"
              value={formatCurrency(trade.fundingAmount)}
              className={trade.fundingAmount >= 0 ? "text-foreground" : "text-muted-foreground"}
            />
            <KpiCard label="Collateral" value={formatCurrency(trade.collateralAmount)} />
            <KpiCard label="Cash Out" value={formatCurrency(trade.cashOut)} />
            <KpiCard label="Margin" value={formatSpread(trade.fundingMargin)} />
            <KpiCard label="Fixed Rate" value={trade.fixedRate != null ? `${trade.fixedRate.toFixed(4)}%` : "N/A"} />
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
              <TabsTrigger value="counterparty">Counterparty</TabsTrigger>
              <TabsTrigger value="funding">Funding & Risk</TabsTrigger>
              <TabsTrigger value="book">Book & Trading</TabsTrigger>
              <TabsTrigger value="goldeneye" className="gap-1.5">
                <Eye className="size-3" />
                Goldeneye
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-1.5">
                <Braces className="size-3" />
                JSON
              </TabsTrigger>
            </TabsList>

            {/* --- Overview Tab --- */}
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Instrument" />
                  <InfoItem icon={ArrowRightLeft} label="Product Type" value={val(trade.productType)} />
                  <InfoItem icon={Layers} label="Sub Type" value={val(trade.productSubType)} />
                  <InfoItem icon={BarChart3} label="Asset Class" value={val(trade.hms_assetClass)} />
                  <InfoItem icon={Landmark} label="Collateral Type" value={val(trade.collateralType)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Counterparty" />
                  <InfoItem icon={Building2} label="Name" value={val(trade.counterParty)} />
                  <InfoItem icon={User} label="Parent" value={val(trade.counterpartyParentName)} />
                  <InfoItem icon={Globe} label="Type" value={val(trade.cp_type)} />
                  <InfoItem icon={MapPin} label="Country of Risk" value={val(trade.i_countryOfRisk)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Ratings" />
                  <InfoItem icon={ShieldCheck} label="S&P" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cp_ratingSnp)}</Badge>
                  } />
                  <InfoItem icon={ShieldCheck} label="Moody's" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cp_ratingMoodys)}</Badge>
                  } />
                  <InfoItem icon={Shield} label="CRR" value={val(trade.cp_crr)} />
                  <InfoItem icon={MapPin} label="Domicile" value={val(trade.cp_country)} />
                </div>
              </div>

              {/* Timeline dates */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                <DateCard label="As of Date" date={trade.asOfDate} />
                <DateCard label="Trade Date" date={trade.tradeDt} />
                <DateCard label="Start Date" date={trade.startDt} />
                <DateCard label="Maturity Date" date={trade.maturityDt} urgent={isUrgent} />
              </div>
            </TabsContent>

            {/* --- Collateral Tab --- */}
            <TabsContent value="collateral" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Security Details" />
                  <InfoItem icon={FileText} label="Description" value={val(trade.collateralDesc)} />
                  <InfoItem icon={Landmark} label="Collateral Name" value={val(trade.i_desc)} />
                  <InfoItem icon={Layers} label="Collateral Type" value={val(trade.collateralType)} />
                  <InfoItem icon={BarChart3} label="Instrument Type" value={val(trade.i_type)} />
                  <InfoItem icon={Building2} label="Issuer" value={val(trade.i_issuerName)} />
                  <InfoItem icon={Hash} label="Issuer LEI" value={
                    <span className="font-mono text-xs">{val(trade.i_issuerLei)}</span>
                  } />
                  <Separator className="my-2" />
                  <InfoItem icon={Percent} label="Coupon" value={trade.i_coupon != null ? `${trade.i_coupon}%` : "N/A"} />
                  <InfoItem icon={CalendarClock} label="Instrument Maturity" value={formatDate(trade.i_maturityDt)} />
                  <InfoItem icon={Wallet} label="Outstanding Amt" value={trade.i_outstandingAmt != null ? formatCurrency(trade.i_outstandingAmt) : "N/A"} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Identifiers & Currency" />
                  <InfoItem icon={Hash} label="ISIN" value={
                    <span className="font-mono text-xs">{val(trade.i_isinId)}</span>
                  } />
                  <InfoItem icon={Hash} label="BBG ID" value={
                    <span className="font-mono text-xs">{val(trade.i_bbgId)}</span>
                  } />
                  <InfoItem icon={Hash} label="Ticker" value={
                    <span className="font-mono text-xs">{val(trade.i_ticker)}</span>
                  } />
                  <InfoItem icon={Hash} label="PALMS Code" value={
                    <span className="font-mono text-xs">{val(trade.i_palmsCode)}</span>
                  } />
                  <Separator className="my-2" />
                  <InfoItem icon={CreditCard} label="Collateral CCY" value={val(trade.collatCurrency)} />
                  <InfoItem icon={CreditCard} label="Instrument CCY" value={val(trade.i_instrumentCcy)} />
                  <Separator className="my-2" />
                  <SectionHeader title="Amounts" />
                  <InfoItem icon={Wallet} label="Collateral Amount" value={formatCurrency(trade.collateralAmount)} />
                  <InfoItem icon={Wallet} label="Collateral (LCY)" value={formatCurrency(trade.collateralAmountLCY)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Geography & Quality" />
                  <InfoItem icon={Globe} label="Region" value={val(trade.i_region)} />
                  <InfoItem icon={MapPin} label="Country" value={val(trade.i_country)} />
                  <InfoItem icon={MapPin} label="Country of Risk" value={val(trade.i_countryOfRisk)} />
                  <Separator className="my-2" />
                  <InfoItem icon={BarChart3} label="Industry Sector" value={val(trade.i_industrySector)} />
                  <InfoItem icon={ShieldCheck} label="Rating" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.i_rating)}</Badge>
                  } />
                  <InfoItem icon={Shield} label="Collateral Quality" value={val(trade.i_collateralQuality)} />
                  <InfoItem icon={Layers} label="Collateral Type (Instr)" value={val(trade.i_collateralType)} />
                </div>
              </div>
            </TabsContent>

            {/* --- Counterparty Tab --- */}
            <TabsContent value="counterparty" className="mt-4">
              <div className="grid grid-cols-3 gap-5">
                <div className="rounded-lg border p-4">
                  <SectionHeader title="Identity" />
                  <InfoItem icon={Building2} label="Name" value={val(trade.counterParty)} />
                  <InfoItem icon={User} label="Parent" value={val(trade.counterpartyParentName)} />
                  <InfoItem icon={User} label="TREATS Parent" value={val(trade.cp_treatsParent)} />
                  <InfoItem icon={Globe} label="Type" value={val(trade.cp_type)} />
                  <InfoItem icon={Hash} label="LEI" value={
                    <span className="font-mono text-xs">{val(trade.cp_lei)}</span>
                  } />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Ratings" />
                  <InfoItem icon={ShieldCheck} label="S&P" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cp_ratingSnp)}</Badge>
                  } />
                  <InfoItem icon={ShieldCheck} label="Moody's" value={
                    <Badge variant="secondary" className="text-[10px]">{val(trade.cp_ratingMoodys)}</Badge>
                  } />
                  <InfoItem icon={Shield} label="CRR" value={val(trade.cp_crr)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Geography" />
                  <InfoItem icon={Globe} label="Region" value={val(trade.cp_region)} />
                  <InfoItem icon={MapPin} label="Domicile" value={val(trade.cp_country)} />
                  <InfoItem icon={MapPin} label="Country of Incorporation" value={val(trade.cp_countryIncorporation)} />
                  <InfoItem icon={MapPin} label="Country of Operation" value={val(trade.cp_countryOperation)} />
                  <InfoItem icon={MapPin} label="Country of Risk" value={val(trade.i_countryOfRisk)} />
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
                  <InfoItem icon={TrendingUp} label="Cash Out" value={formatCurrency(trade.cashOut)} />
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
                {([
                  { label: "FX Spot", value: formatNum(trade.fxSpot, 4), tabular: true },
                  { label: "FX Pair", value: val(trade.fxPair), tabular: false },
                  { label: "FX Pair (Funding)", value: val(trade.fxPairFunding), tabular: false },
                ] as const).map((fx) => (
                  <div key={fx.label} className="flex items-center gap-3 rounded-lg border p-3">
                    <Globe className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">{fx.label}</p>
                      <p className={cn("text-sm font-medium", fx.tabular && "tabular-nums")}>{fx.value}</p>
                    </div>
                  </div>
                ))}
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
                  <InfoItem icon={Layers} label="Book Category" value={val(trade.hms_bookCategory)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Trading" />
                  <InfoItem icon={User} label="Trader" value={val(trade.hms_primaryTrader)} />
                  <InfoItem icon={MapPin} label="Location" value={val(trade.hms_tradingLocation)} />
                  <InfoItem icon={Globe} label="Region" value={val(trade.hms_region)} />
                  <InfoItem icon={Globe} label="Sub Region" value={val(trade.hms_subRegion)} />
                </div>

                <div className="rounded-lg border p-4">
                  <SectionHeader title="Legal Entity" />
                  <InfoItem icon={Building2} label="LE Name" value={val(trade.hms_leName)} />
                  <InfoItem icon={Hash} label="CP LEI" value={
                    <span className="font-mono text-xs">{val(trade.cp_lei)}</span>
                  } />
                </div>
              </div>
            </TabsContent>

            {/* --- Goldeneye Tab --- */}
            <TabsContent value="goldeneye" className="mt-4">
              <GoldeneyePanel
                tradeId={trade.tradeId}
                cachedData={goldeneyeData}
                onDataLoaded={(data) => {
                  setGoldeneyeData(data)
                  setGoldeneyeTradeId(trade.tradeId)
                }}
              />
            </TabsContent>

            {/* --- JSON Tab --- */}
            <TabsContent value="json" className="mt-4">
              <div className="mb-3 flex justify-end">
                <CopyJsonButton data={trade} />
              </div>
              <ScrollArea className="h-[400px]">
                <JsonViewer data={trade} />
              </ScrollArea>
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

function CopyJsonButton({ data }: { data: unknown }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [data])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  )
}

const GOLDENEYE_MODELS = [
  { value: "gem", label: "GEM" },
  { value: "qml", label: "QML" },
  { value: "ucon", label: "UCON" },
] as const

function GoldeneyePanel({
  tradeId,
  cachedData,
  onDataLoaded,
}: {
  tradeId: string
  cachedData: unknown
  onDataLoaded: (data: unknown) => void
}) {
  const [model, setModel] = React.useState("gem")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFetch = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${basePath}/api/goldeneye?tradeId=${encodeURIComponent(tradeId)}&model=${model}`,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }
      const json = await res.json()
      onDataLoaded(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [tradeId, model, onDataLoaded])

  if (cachedData) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase">{model}</Badge>
            <span className="text-xs text-muted-foreground">Trade {tradeId}</span>
          </div>
          <div className="flex items-center gap-2">
            <CopyJsonButton data={cachedData} />
            <button
              onClick={() => onDataLoaded(null)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Re-fetch
            </button>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <JsonViewer data={cachedData} />
        </ScrollArea>
      </div>
    )
  }

  if (!loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Eye className="size-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Goldeneye Trade Lookup</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fetch trade <span className="font-mono">{tradeId}</span> from Goldeneye
          </p>
        </div>
        <div className="flex items-center gap-2">
          {GOLDENEYE_MODELS.map((m) => (
            <button
              key={m.value}
              onClick={() => setModel(m.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                model === m.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleFetch}
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Eye className="size-3.5" />
          Fetch Trade
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Fetching from Goldeneye ({model.toUpperCase()})...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <Eye className="size-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
        <button
          onClick={handleFetch}
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
        >
          Retry
        </button>
      </div>
    )
  }

  return null
}
