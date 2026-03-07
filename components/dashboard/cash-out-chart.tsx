"use client"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { BarChart3, Settings, Download, Maximize2, Copy } from "lucide-react"

const chartData = [
  { month: "Jan 2023", Market_Access: 1200 },
  { month: "Apr 2023", Market_Access: 2100 },
  { month: "Jul 2023", Market_Access: 3400 },
  { month: "Oct 2023", Market_Access: 4200 },
  { month: "Jan 2024", Market_Access: 5800 },
  { month: "Apr 2024", Market_Access: 7200 },
  { month: "Jul 2024", Market_Access: 9800 },
  { month: "Oct 2024", Market_Access: 11500 },
  { month: "Jan 2025", Market_Access: 12700 },
  { month: "Apr 2025", Market_Access: 10200 },
  { month: "Jul 2025", Market_Access: 8500 },
  { month: "Oct 2025", Market_Access: 7100 },
  { month: "Jan 2026", Market_Access: 5800 },
  { month: "Feb 2026", Market_Access: 4200 },
  { month: "Mar 2026", Market_Access: 3800 },
]

function formatYAxis(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`
  return `$${value}M`
}

export function CashOutChart() {
  return (
    <Card className="flex-1">
      <CardHeader className="flex-row items-center gap-2 pb-0">
        <BarChart3 className="size-4 text-muted-foreground" />
        <Tabs defaultValue="historical" className="flex-1">
          <TabsList variant="line">
            <TabsTrigger value="historical">Historical Cash Out</TabsTrigger>
            <TabsTrigger value="future">Future Cash Out</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-2 flex justify-end gap-2">
          <Settings className="size-4 text-muted-foreground" />
          <Download className="size-4 text-muted-foreground" />
          <Copy className="size-4 text-muted-foreground" />
          <Maximize2 className="size-4 text-muted-foreground" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
              }}
            />
            <Legend />
            <Bar
              dataKey="Market_Access"
              fill="var(--foreground)"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
