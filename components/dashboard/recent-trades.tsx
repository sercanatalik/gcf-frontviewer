"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Trade {
  id: string
  name: string
  code: string
  details: string
  bookedAgo: string
  maturity: string
  avatar: string
}

const recentTradesData: Trade[] = [
  {
    id: "1",
    name: "PHRAOVC",
    code: "EGYTB 0 04/07/26 364D",
    details: "EGP - 75.00bp - EMS_CCS_STR",
    bookedAgo: "Booked a day ago",
    maturity: "maturity in a month",
    avatar: "",
  },
  {
    id: "2",
    name: "Schonfeld Strategic Advisors - SEFRLPQ",
    code: "EGYTB 0 09/08/2026 EGP 364",
    details: "EGP - 70.00bp - EMS_CCS_STR",
    bookedAgo: "Booked 2 days ago",
    maturity: "maturity in 3 months",
    avatar: "SSA",
  },
  {
    id: "3",
    name: "KWWF4LP",
    code: "EGYTB 0 03/31/2026 EGP 364",
    details: "EGP - 70.00bp - EMS_CCS_STR",
    bookedAgo: "Booked a day ago",
    maturity: "maturity in 24 days",
    avatar: "",
  },
  {
    id: "4",
    name: "PSCJ015",
    code: "EGYTB 0 06/23/2026 EGP 364",
    details: "EGP - 70.00bp - EMS_CCS_STR",
    bookedAgo: "Booked 2 days ago",
    maturity: "maturity in 4 months",
    avatar: "",
  },
  {
    id: "5",
    name: "Garda Capital Partners - 8RFPOVC",
    code: "EGYTB 0 12/08/26 364D",
    details: "EGP - 70.00bp - EMS_CCS_STR",
    bookedAgo: "Booked a day ago",
    maturity: "maturity in 3 months",
    avatar: "GCP",
  },
  {
    id: "6",
    name: "Hsbc Holdings - HS8CHKH",
    code: "CGB 2.52 08/25/33 INBK",
    details: "CNY - 0.00bp - TRS_INF_RFD",
    bookedAgo: "Booked 3 days ago",
    maturity: "maturity in 3 months",
    avatar: "HH",
  },
  {
    id: "7",
    name: "ARMZ001",
    code: "CGB 2.52 08/25/33 INBK",
    details: "CNY - 0.00bp - TRS_INF_RFD",
    bookedAgo: "Booked 3 days ago",
    maturity: "maturity in 3 months",
    avatar: "",
  },
  {
    id: "8",
    name: "Balyasny Asset Management - PAONOVC",
    code: "EGYTB 0 08/02/2026 EGP 364",
    details: "EGP - 75.00bp - EMS_CCS_STR",
    bookedAgo: "Booked 3 days ago",
    maturity: "maturity in 3 months",
    avatar: "BAM",
  },
]

function TradeItem({ trade }: { trade: Trade }) {
  return (
    <div className="flex items-start gap-3 border-b py-3 last:border-b-0">
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback className="text-[10px]">
          {trade.avatar || "--"}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-xs font-medium">{trade.name}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {trade.code} - {trade.details}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {trade.bookedAgo} - {trade.maturity}
        </span>
      </div>
    </div>
  )
}

export function RecentTrades() {
  return (
    <Card className="w-full min-w-[320px] lg:w-[380px]">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>
          Recent activity: 75 counterparties, 191 instruments, and 19 currencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="w-full">
            <TabsTrigger value="recent" className="flex-1">
              Recent Trades
            </TabsTrigger>
            <TabsTrigger value="maturing" className="flex-1">
              Maturing Soon
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recent">
            <ScrollArea className="h-[380px]">
              <div className="flex flex-col">
                {recentTradesData.map((trade) => (
                  <TradeItem key={trade.id} trade={trade} />
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-foreground">
                <ChevronLeft className="size-3" /> Previous
              </button>
              <button className="flex items-center gap-1 hover:text-foreground">
                Next <ChevronRight className="size-3" />
              </button>
            </div>
          </TabsContent>
          <TabsContent value="maturing">
            <div className="flex h-[380px] items-center justify-center text-sm text-muted-foreground">
              No maturing trades
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
