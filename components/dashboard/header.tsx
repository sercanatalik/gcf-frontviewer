import { Home, ChevronRight } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Home className="size-3" />
        <span>Home</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground">Financing</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Financing Frontview</h1>
    </div>
  )
}
