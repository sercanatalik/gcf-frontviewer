import {
  Banknote,
  TrendingUp,
  BarChart3,
  Globe,
  Users,
  Layers,
  BookOpen,
  Percent,
  Hash,
  Shield,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  Coins,
} from "lucide-react"
import { F } from "@/lib/field-defs"
import type { TrendParams } from "./use-trend-data"

export type ChartType = "area" | "line" | "bar" | "stackedArea" | "stackedBar"

export type FormatterType = "currency" | "count" | "bps" | "percent" | "days" | "number"

export interface TrendCardDef {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  chartType: ChartType
  params: TrendParams
  formatter: FormatterType
  size: "normal" | "wide"
}

export const trendCards: TrendCardDef[] = [
  // ── Row 1: Funding headline ────────────────────────────────────────
  {
    id: "funding-volume",
    title: "Funding Volume",
    description: "Total funding amount over time",
    icon: Banknote,
    iconColor: "text-emerald-500",
    chartType: "area",
    params: { field: F.fundingAmount, aggregation: "sum" },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "trade-count",
    title: "Trade Count",
    description: "Number of active trades per day",
    icon: Hash,
    iconColor: "text-violet-500",
    chartType: "bar",
    params: { field: F.tradeId, aggregation: "count" },
    formatter: "count",
    size: "normal",
  },
  {
    id: "cashout-trend",
    title: "Cash Out",
    description: "Net cash out over time",
    icon: BarChart3,
    iconColor: "text-teal-500",
    chartType: "bar",
    params: { field: F.cashOut, aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },

  // ── Row 2: Rates & risk ────────────────────────────────────────────
  {
    id: "avg-spread",
    title: "Weighted Avg Spread",
    description: "Funding-weighted average margin (bps)",
    icon: TrendingUp,
    iconColor: "text-amber-500",
    chartType: "line",
    params: { field: F.fundingMargin, aggregation: "avgBy", weightField: F.fundingAmount },
    formatter: "bps",
    size: "normal",
  },
  {
    id: "avg-fixed-rate",
    title: "Average Fixed Rate",
    description: "Funding-weighted average fixed rate",
    icon: Percent,
    iconColor: "text-rose-500",
    chartType: "line",
    params: { field: F.fixedRate, aggregation: "avgBy", weightField: F.fundingAmount },
    formatter: "percent",
    size: "normal",
  },
  {
    id: "avg-haircut",
    title: "Average Haircut",
    description: "Funding-weighted haircut trend",
    icon: Shield,
    iconColor: "text-orange-500",
    chartType: "line",
    params: { field: F.haircut, aggregation: "avgBy", weightField: F.fundingAmount },
    formatter: "percent",
    size: "normal",
  },
  {
    id: "avg-dtm",
    title: "Avg Days to Maturity",
    description: "Funding-weighted average maturity",
    icon: Clock,
    iconColor: "text-sky-500",
    chartType: "area",
    params: { field: F.dtm, aggregation: "avgBy", weightField: F.fundingAmount },
    formatter: "days",
    size: "normal",
  },

  // ── Row 3: Breakdowns ──────────────────────────────────────────────
  {
    id: "product-mix",
    title: "Product Mix",
    description: "Funding by product type over time",
    icon: Layers,
    iconColor: "text-indigo-500",
    chartType: "stackedArea",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.productType, topN: 6 },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "top-counterparties",
    title: "Top Counterparties",
    description: "Funding exposure by top counterparties",
    icon: Users,
    iconColor: "text-orange-500",
    chartType: "stackedArea",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.counterParty, topN: 5 },
    formatter: "currency",
    size: "wide",
  },

  // ── Row 4: Desk & region ───────────────────────────────────────────
  {
    id: "desk-activity",
    title: "Desk Activity",
    description: "Funding volume by desk over time",
    icon: Building2,
    iconColor: "text-blue-500",
    chartType: "stackedBar",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.hmsDesk, topN: 5 },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "region-breakdown",
    title: "Regional Distribution",
    description: "Funding by trading region over time",
    icon: Globe,
    iconColor: "text-pink-500",
    chartType: "stackedArea",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.hms_region, topN: 5 },
    formatter: "currency",
    size: "normal",
  },
  {
    id: "cashout-by-desk",
    title: "Cash Out by Desk",
    description: "Cash out by desk over time",
    icon: ArrowRightLeft,
    iconColor: "text-red-400",
    chartType: "stackedBar",
    params: { field: F.cashOut, aggregation: "sum", groupBy: F.hmsDesk, topN: 5 },
    formatter: "currency",
    size: "normal",
  },

  // ── Row 5: Collateral & currency ───────────────────────────────────
  {
    id: "collateral-by-currency",
    title: "Collateral by Currency",
    description: "Collateral distribution across currencies",
    icon: Coins,
    iconColor: "text-cyan-500",
    chartType: "stackedArea",
    params: { field: F.collateralAmount, aggregation: "sum", groupBy: F.collatCurrency, topN: 5 },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "collateral-by-region",
    title: "Collateral by Region",
    description: "Collateral distribution across regions",
    icon: Globe,
    iconColor: "text-amber-500",
    chartType: "stackedArea",
    params: { field: F.collateralAmount, aggregation: "sum", groupBy: F.hms_region, topN: 5 },
    formatter: "currency",
    size: "normal",
  },
  {
    id: "cp-type-mix",
    title: "Counterparty Type Mix",
    description: "Funding by counterparty classification",
    icon: Users,
    iconColor: "text-violet-500",
    chartType: "stackedBar",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.cp_type, topN: 5 },
    formatter: "currency",
    size: "normal",
  },

  // ── Row 6: Accruals ────────────────────────────────────────────────
  {
    id: "daily-accrual",
    title: "Daily Accrual",
    description: "Daily accrual income over time",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    chartType: "area",
    params: { field: F.accrualDaily, aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },
  {
    id: "projected-accrual",
    title: "Projected Accrual",
    description: "Projected accrual income trend",
    icon: BarChart3,
    iconColor: "text-blue-500",
    chartType: "area",
    params: { field: F.accrualProjected, aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },

  // ── Row 7: Strategy ────────────────────────────────────────────────
  {
    id: "strategy-sl1",
    title: "Strategy (SL1) Breakdown",
    description: "Funding by primary strategy classification",
    icon: BookOpen,
    iconColor: "text-indigo-500",
    chartType: "stackedArea",
    params: { field: F.fundingAmount, aggregation: "sum", groupBy: F.hmsSL1, topN: 5 },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "distinct-clients",
    title: "Active Clients",
    description: "Distinct counterparties per day",
    icon: Users,
    iconColor: "text-orange-500",
    chartType: "bar",
    params: { field: F.counterParty, aggregation: "countDistinct" },
    formatter: "count",
    size: "normal",
  },
  {
    id: "wwr-exposure",
    title: "Wrong Way Risk",
    description: "Cash out flagged as wrong way risk",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    chartType: "area",
    params: { field: F.cashOut, aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },
]
