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
} from "lucide-react"
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
  {
    id: "funding-volume",
    title: "Funding Volume",
    description: "Total funding amount over time",
    icon: Banknote,
    iconColor: "text-emerald-500",
    chartType: "area",
    params: { field: "fundingAmount", aggregation: "sum" },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "collateral-by-currency",
    title: "Collateral by Currency",
    description: "Collateral distribution across currencies",
    icon: Globe,
    iconColor: "text-cyan-500",
    chartType: "stackedArea",
    params: {
      field: "collateralAmount",
      aggregation: "sum",
      groupBy: "collatCurrency",
      topN: 5,
    },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "trade-count",
    title: "Trade Count",
    description: "Number of trades per date",
    icon: Hash,
    iconColor: "text-violet-500",
    chartType: "bar",
    params: { field: "tradeId", aggregation: "count" },
    formatter: "count",
    size: "normal",
  },
  {
    id: "avg-spread",
    title: "Average Spread",
    description: "Weighted average funding margin",
    icon: Percent,
    iconColor: "text-amber-500",
    chartType: "line",
    params: {
      field: "fundingMargin",
      aggregation: "avgBy",
      weightField: "fundingAmount",
    },
    formatter: "bps",
    size: "normal",
  },
  {
    id: "avg-fixed-rate",
    title: "Average Fixed Rate",
    description: "Weighted average fixed rate",
    icon: Percent,
    iconColor: "text-rose-500",
    chartType: "line",
    params: {
      field: "fixedRate",
      aggregation: "avgBy",
      weightField: "fundingAmount",
    },
    formatter: "percent",
    size: "normal",
  },
  {
    id: "top-counterparties",
    title: "Top Counterparties",
    description: "Funding by top counterparties over time",
    icon: Users,
    iconColor: "text-orange-500",
    chartType: "stackedArea",
    params: {
      field: "fundingAmount",
      aggregation: "sum",
      groupBy: "counterParty",
      topN: 5,
    },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "desk-activity",
    title: "Desk Activity",
    description: "Funding volume by desk over time",
    icon: BookOpen,
    iconColor: "text-blue-500",
    chartType: "stackedBar",
    params: {
      field: "fundingAmount",
      aggregation: "sum",
      groupBy: "hmsDesk",
      topN: 5,
    },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "exposure-trend",
    title: "Financing Exposure",
    description: "Total exposure trend over time",
    icon: TrendingUp,
    iconColor: "text-red-500",
    chartType: "area",
    params: { field: "financingExposure", aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },
  {
    id: "product-mix",
    title: "Product Mix",
    description: "Funding by product type over time",
    icon: Layers,
    iconColor: "text-indigo-500",
    chartType: "stackedArea",
    params: {
      field: "fundingAmount",
      aggregation: "sum",
      groupBy: "productType",
      topN: 6,
    },
    formatter: "currency",
    size: "wide",
  },
  {
    id: "cashout-trend",
    title: "Cash Out",
    description: "Net cash out over time",
    icon: BarChart3,
    iconColor: "text-teal-500",
    chartType: "bar",
    params: { field: "cashOut", aggregation: "sum" },
    formatter: "currency",
    size: "normal",
  },
  {
    id: "region-breakdown",
    title: "Regional Distribution",
    description: "Funding by trading region over time",
    icon: Globe,
    iconColor: "text-pink-500",
    chartType: "stackedArea",
    params: {
      field: "fundingAmount",
      aggregation: "sum",
      groupBy: "region",
      topN: 5,
    },
    formatter: "currency",
    size: "normal",
  },
]
