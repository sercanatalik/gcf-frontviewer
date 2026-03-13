import { ArrowUpDown } from "lucide-react"

interface SortHeaderProps<T extends string> {
  children: React.ReactNode
  field: T
  active?: boolean
  onSort: (field: T) => void
}

export function SortHeader<T extends string>({ children, field, active, onSort }: SortHeaderProps<T>) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className={`size-3 ${active ? "text-foreground" : "text-muted-foreground/50"}`} />
    </button>
  )
}
