import {
  Copy,
  Users,
  Briefcase,
  Coins,
  DollarSign,
  BookOpen,
  UserCheck,
  TrendingUp,
  Minus,
} from "lucide-react"

interface StatItem {
  label: string
  value: string | number
  delta: number
  icon: React.ReactNode
  color: string
}

const statsData: StatItem[] = [
  { label: "Trades", value: 513, delta: 26, icon: <Copy className="size-4" />, color: "hsl(217, 91%, 60%)" },
  { label: "Clients", value: 76, delta: 3, icon: <Users className="size-4" />, color: "hsl(221, 83%, 53%)" },
  { label: "Assets", value: 198, delta: 7, icon: <Briefcase className="size-4" />, color: "hsl(224, 76%, 48%)" },
  { label: "Collateral Ccy", value: 19, delta: 0, icon: <Coins className="size-4" />, color: "hsl(226, 71%, 40%)" },
  { label: "Funding Ccy", value: 6, delta: 0, icon: <DollarSign className="size-4" />, color: "hsl(217, 60%, 68%)" },
  { label: "Books", value: 16, delta: 2, icon: <BookOpen className="size-4" />, color: "hsl(217, 91%, 60%)" },
  { label: "Traders", value: 5, delta: 1, icon: <UserCheck className="size-4" />, color: "hsl(221, 83%, 53%)" },
]

export function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 border bg-card px-4 py-4"
          style={{ borderLeftWidth: 3, borderLeftColor: stat.color }}
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: stat.color + "18", color: stat.color }}
          >
            {stat.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs text-muted-foreground">
              {stat.label}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-semibold tabular-nums leading-tight">
                {stat.value}
              </span>
              {stat.delta > 0 ? (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
                  <TrendingUp className="size-2.5" />
                  +{stat.delta}
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Minus className="size-2.5" />
                  0
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
