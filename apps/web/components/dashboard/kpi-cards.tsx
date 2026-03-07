import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

interface KpiCardProps {
  title: string
  value: string
  delta: string
  trend: "up" | "down"
  footerLabel: string
  footerDescription: string
}

function KpiCard({
  title,
  value,
  delta,
  trend,
  footerLabel,
  footerDescription,
}: KpiCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {trend === "up" ? (
              <TrendingUpIcon data-icon="inline-start" />
            ) : (
              <TrendingDownIcon data-icon="inline-start" />
            )}
            {delta}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerLabel}
          {trend === "up" ? (
            <TrendingUpIcon className="size-4" />
          ) : (
            <TrendingDownIcon className="size-4" />
          )}
        </div>
        <div className="text-muted-foreground">{footerDescription}</div>
      </CardFooter>
    </Card>
  )
}

const kpiData: KpiCardProps[] = [
  {
    title: "Cash Out",
    value: "$3.96B",
    delta: "-22.2%",
    trend: "down",
    footerLabel: "Down $1.13B this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Funding Amount",
    value: "$5.57B",
    delta: "+15.3%",
    trend: "up",
    footerLabel: "Up $738.8M this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Collateral Amount",
    value: "$7.45B",
    delta: "+43.3%",
    trend: "up",
    footerLabel: "Up $2.25B this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Average Spread",
    value: "58.01bps",
    delta: "+73.9%",
    trend: "up",
    footerLabel: "Up 24.66bps this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Average Maturity",
    value: "113 days",
    delta: "-1.7%",
    trend: "down",
    footerLabel: "Down 2 days this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Daily Accrual",
    value: "$90K",
    delta: "+100%",
    trend: "up",
    footerLabel: "Up $45K this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Projected Accrual",
    value: "$11.2M",
    delta: "+187%",
    trend: "up",
    footerLabel: "Up $7.3M this period",
    footerDescription: "Compared to 180 days ago",
  },
  {
    title: "Realized Accrual",
    value: "$14.2M",
    delta: "+77.5%",
    trend: "up",
    footerLabel: "Up $6.2M this period",
    footerDescription: "Compared to 180 days ago",
  },
]

export function KpiCards() {
  return (
    <div className="*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
