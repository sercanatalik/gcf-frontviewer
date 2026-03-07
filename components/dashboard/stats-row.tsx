import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Copy,
  Users,
  Briefcase,
  Coins,
  DollarSign,
  BookOpen,
  UserCheck,
} from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change: string
  icon: React.ReactNode
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <Card size="sm" className="min-w-[130px] flex-1">
      <CardContent className="flex flex-col gap-1 p-0 px-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          {icon}
        </div>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-[11px] text-muted-foreground">{change}</span>
      </CardContent>
    </Card>
  )
}

const statsData: StatCardProps[] = [
  {
    label: "#Trades",
    value: 513,
    change: "+ 26 since 180 days ago",
    icon: <Copy className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#Clients",
    value: 76,
    change: "+ 3 since 180 days ago",
    icon: <Users className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#Assets",
    value: 198,
    change: "+ 7 since 180 days ago",
    icon: <Briefcase className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#CollateralCurr...",
    value: 19,
    change: "+ 0 since 180 days ago",
    icon: <Coins className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#FundingCurre...",
    value: 6,
    change: "+ 0 since 180 days ago",
    icon: <DollarSign className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#Books",
    value: 16,
    change: "+ 2 since 180 days ago",
    icon: <BookOpen className="size-3.5 text-muted-foreground" />,
  },
  {
    label: "#Trader",
    value: 5,
    change: "+ 1 since 180 days ago",
    icon: <UserCheck className="size-3.5 text-muted-foreground" />,
  },
]

export function StatsRow() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {statsData.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
