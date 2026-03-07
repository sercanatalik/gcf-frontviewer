"use client"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

const tradingLocationData = [
  { location: "London", trades: 187, volume: "$1.42B" },
  { location: "New York", trades: 156, volume: "$1.18B" },
  { location: "Hong Kong", trades: 98, volume: "$0.72B" },
  { location: "Tokyo", trades: 45, volume: "$0.38B" },
  { location: "Singapore", trades: 27, volume: "$0.26B" },
]

const portfolioData = [
  { portfolio: "EM Rates", trades: 210, volume: "$1.85B" },
  { portfolio: "G10 Rates", trades: 142, volume: "$1.12B" },
  { portfolio: "Credit", trades: 89, volume: "$0.56B" },
  { portfolio: "FX", trades: 72, volume: "$0.43B" },
]

const topClientsData = [
  { client: "Garda Capital Partners", trades: 42, volume: "$380M" },
  { client: "Balyasny Asset Management", trades: 38, volume: "$320M" },
  { client: "Schonfeld Strategic Advisors", trades: 35, volume: "$290M" },
  { client: "Hsbc Holdings", trades: 28, volume: "$245M" },
  { client: "Citadel Securities", trades: 25, volume: "$210M" },
]

function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | number)[][]
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-xs text-muted-foreground">
          {headers.map((h) => (
            <th key={h} className="pb-2.5 text-left font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b transition-colors last:border-b-0 hover:bg-muted/30">
            {row.map((cell, j) => (
              <td key={j} className="py-2.5 tabular-nums">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function BottomTabs() {
  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="location">
          <TabsList variant="line">
            <TabsTrigger value="location">By Trading Location</TabsTrigger>
            <TabsTrigger value="portfolio">By Portfolio</TabsTrigger>
            <TabsTrigger value="clients">Top Clients</TabsTrigger>
          </TabsList>
          <TabsContent value="location" className="pt-4">
            <DataTable
              headers={["Location", "Trades", "Volume"]}
              rows={tradingLocationData.map((d) => [
                d.location,
                d.trades,
                d.volume,
              ])}
            />
          </TabsContent>
          <TabsContent value="portfolio" className="pt-4">
            <DataTable
              headers={["Portfolio", "Trades", "Volume"]}
              rows={portfolioData.map((d) => [
                d.portfolio,
                d.trades,
                d.volume,
              ])}
            />
          </TabsContent>
          <TabsContent value="clients" className="pt-4">
            <DataTable
              headers={["Client", "Trades", "Volume"]}
              rows={topClientsData.map((d) => [
                d.client,
                d.trades,
                d.volume,
              ])}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
