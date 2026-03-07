"use client"

import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"
import {
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Trash2,
  Diamond,
  DollarSign,
} from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change: string
  period: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function KpiCard({ title, value, change, period, icon, trend = "up" }: KpiCardProps) {
  return (
    <Card className="min-w-[180px] flex-1 gap-2 py-3">
      <CardContent className="flex flex-col gap-1 p-0 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{title}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" ? (
            <ArrowUpRight className="size-3 text-emerald-500" />
          ) : trend === "down" ? (
            <ArrowDownRight className="size-3 text-red-500" />
          ) : null}
          {change} {period}
        </span>
      </CardContent>
    </Card>
  )
}

const kpiData: KpiCardProps[] = [
  {
    title: "Cash Out",
    value: "$3.96B",
    change: "-$1.13B since 180 days ago",
    period: "",
    icon: <Copy className="size-4" />,
    trend: "down",
  },
  {
    title: "Funding Amount",
    value: "$5.57B",
    change: "+ $738.8M since 180 days ago",
    period: "",
    icon: <Copy className="size-4" />,
    trend: "up",
  },
  {
    title: "Collateral Amount",
    value: "$7.45B",
    change: "+ $2.25B since 180 days ago",
    period: "",
    icon: <Trash2 className="size-4" />,
    trend: "up",
  },
  {
    title: "Average Spread",
    value: "58.01bps",
    change: "+ 24.66bps since 180 days ago",
    period: "",
    icon: <Diamond className="size-4" />,
    trend: "up",
  },
  {
    title: "Average Maturity",
    value: "113days",
    change: "-2days since 180 days ago",
    period: "",
    icon: <Diamond className="size-4" />,
    trend: "down",
  },
  {
    title: "Daily Accrual",
    value: "$90K",
    change: "+ $45K since 180 days ago",
    period: "",
    icon: <DollarSign className="size-4" />,
    trend: "up",
  },
  {
    title: "Projected Accrual",
    value: "$11.2M",
    change: "+ $7.3M since 180 days ago",
    period: "",
    icon: <DollarSign className="size-4" />,
    trend: "up",
  },
  {
    title: "Realized Accrual",
    value: "$14.2M",
    change: "+ $6.2M since 180 days ago",
    period: "",
    icon: <DollarSign className="size-4" />,
    trend: "up",
  },
]

export function KpiCards() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
