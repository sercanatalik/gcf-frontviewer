"use client"

import { useRef } from "react"
import { TrendingUpIcon, TrendingDownIcon, Expand, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import html2canvas from "html2canvas-pro"
import type { KpiCardProps } from "./types"

export function KpiCard({
  title,
  value,
  delta,
  trend,
  footerLabel,
  footerDescription,
}: KpiCardProps) {
  const TrendIcon = trend === "up" ? TrendingUpIcon : TrendingDownIcon
  const modalContentRef = useRef<HTMLDivElement>(null)

  const downloadAsPNG = async () => {
    if (!modalContentRef.current) return
    try {
      const canvas = await html2canvas(modalContentRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      const link = document.createElement("a")
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Error downloading chart:", error)
    }
  }

  return (
    <Dialog>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
          <CardAction>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <TrendIcon data-icon="inline-start" />
                {delta}
              </Badge>
              <DialogTrigger asChild>
                <Expand className="h-3.5 w-3.5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
              </DialogTrigger>
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footerLabel}
            <TrendIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{footerDescription}</div>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title} - Expanded View</DialogTitle>
          <DialogDescription>Detailed breakdown of {title.toLowerCase()}</DialogDescription>
          <button
            onClick={downloadAsPNG}
            className="ring-offset-background focus:ring-ring absolute top-4 right-10 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
          >
            <Download className="size-4" />
          </button>
        </DialogHeader>

        <div ref={modalContentRef} className="space-y-6 p-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{value}</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className={
                  trend === "up"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              >
                <TrendIcon className="size-4" />
                {delta}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Change</span>
              <span className="text-sm font-medium">{footerLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Period</span>
              <span className="text-sm font-medium">{footerDescription}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trend</span>
              <span className="flex items-center gap-1 text-sm font-medium">
                <TrendIcon className="size-4" />
                {trend === "up" ? "Upward" : "Downward"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
