"use client"

import { useRef } from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  Expand,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react"
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
import type { KpiMeasure, KpiStatData } from "./types"
import { formatKpiValue, formatDelta, formatFooter } from "./utils"

interface KpiCardProps {
  measure: KpiMeasure
  data?: KpiStatData
  relativeDays: number
  isLoading: boolean
  error?: Error | null
}

export function KpiCard({ measure, data, relativeDays, isLoading, error }: KpiCardProps) {
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
      link.download = `${measure.key}-${new Date().toISOString().split("T")[0]}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Error downloading chart:", err)
    }
  }

  const trend = data ? (data.change >= 0 ? "up" : "down") : "up"
  const TrendIcon = trend === "up" ? TrendingUpIcon : TrendingDownIcon

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{measure.label}</CardDescription>
          <div className="flex h-10 items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{measure.label}</CardDescription>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-sm text-destructive">Error</span>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  const value = formatKpiValue(data.current, measure.formatter)
  const delta = formatDelta(data.changePercent)
  const footer = formatFooter(data, measure.formatter, relativeDays)

  return (
    <Dialog>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{measure.label}</CardDescription>
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
            {footer.label}
            <TrendIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{footer.description}</div>
        </CardFooter>
      </Card>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{measure.label} - Expanded View</DialogTitle>
          <DialogDescription>
            Detailed breakdown of {measure.label.toLowerCase()}
          </DialogDescription>
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
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Previous</span>
              <span className="text-sm font-medium">
                {formatKpiValue(data.previous, measure.formatter)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Change</span>
              <span className="text-sm font-medium">{footer.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Period</span>
              <span className="text-sm font-medium">{footer.description}</span>
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
