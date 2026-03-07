export interface KpiCardProps {
  title: string
  value: string
  delta: string
  trend: "up" | "down"
  footerLabel: string
  footerDescription: string
}
