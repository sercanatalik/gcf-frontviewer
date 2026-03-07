import { Badge } from "@workspace/ui/components/badge"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface FilterItem {
  icon?: string
  label: string
  value: string
}

const filters: FilterItem[] = [
  { icon: "desk", label: "Desk", value: "is (3) 3 selected" },
  { icon: "chart", label: "hmsSL1", value: "is Market Access" },
  { icon: "type", label: "Product Type", value: "is TotalReturnSwap" },
]

export function FilterBar() {
  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => (
        <Badge key={filter.label} variant="outline" className="h-6 gap-1.5 px-2">
          <span className="text-muted-foreground">{filter.label}</span>
          <span className="font-medium">{filter.value}</span>
          <X className="size-3 cursor-pointer text-muted-foreground hover:text-foreground" />
        </Badge>
      ))}
      <Button variant="ghost" size="xs" className="gap-1 text-xs text-muted-foreground">
        <RotateCcw className="size-3" />
        Reset
      </Button>
    </div>
  )
}
