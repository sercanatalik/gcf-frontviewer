"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue }

function getTypeColor(value: JsonValue): string {
  if (value === null || value === undefined) return "text-muted-foreground/60"
  if (typeof value === "string") return "text-emerald-500 dark:text-emerald-400"
  if (typeof value === "number") return "text-blue-500 dark:text-blue-400"
  if (typeof value === "boolean") return "text-amber-500 dark:text-amber-400"
  return "text-foreground"
}

function getTypeBadge(value: JsonValue): string | null {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (Array.isArray(value)) return `array[${value.length}]`
  if (typeof value === "object") return `object{${Object.keys(value).length}}`
  return null
}

function JsonString({ value }: { value: string }) {
  const isDate = /^\d{4}-\d{2}-\d{2}/.test(value)
  return (
    <span className={cn("text-emerald-500 dark:text-emerald-400", isDate && "underline decoration-dotted underline-offset-2 decoration-emerald-500/30")}>
      &quot;{value}&quot;
    </span>
  )
}

function JsonNode({
  keyName,
  value,
  isLast,
  depth,
  defaultExpanded,
}: {
  keyName?: string
  value: JsonValue
  isLast: boolean
  depth: number
  defaultExpanded: boolean
}) {
  const isExpandable =
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? Object.keys(value).length > 0
      : Array.isArray(value) && value.length > 0

  const [expanded, setExpanded] = React.useState(
    defaultExpanded && depth < 2,
  )

  const comma = isLast ? "" : ","

  if (!isExpandable) {
    return (
      <div className="flex items-baseline gap-0 leading-7 hover:bg-muted/50 rounded-sm px-1 -mx-1">
        {keyName !== undefined && (
          <>
            <span className="text-violet-500 dark:text-violet-400 shrink-0">&quot;{keyName}&quot;</span>
            <span className="text-muted-foreground mx-1">:</span>
          </>
        )}
        {value === null ? (
          <span className="text-muted-foreground/60 italic">null</span>
        ) : value === undefined ? (
          <span className="text-muted-foreground/60 italic">undefined</span>
        ) : typeof value === "string" ? (
          <JsonString value={value} />
        ) : typeof value === "boolean" ? (
          <span className="text-amber-500 dark:text-amber-400 font-medium">{String(value)}</span>
        ) : typeof value === "number" ? (
          <span className="text-blue-500 dark:text-blue-400 tabular-nums">{String(value)}</span>
        ) : Array.isArray(value) ? (
          <span className="text-muted-foreground">[]</span>
        ) : (
          <span className="text-muted-foreground">{"{}"}</span>
        )}
        <span className="text-muted-foreground">{comma}</span>
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const entries = isArray
    ? (value as JsonValue[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, JsonValue>)

  const openBrace = isArray ? "[" : "{"
  const closeBrace = isArray ? "]" : "}"
  const badge = getTypeBadge(value)

  return (
    <div>
      <div
        className="flex items-baseline gap-0 cursor-pointer leading-7 hover:bg-muted/50 rounded-sm px-1 -mx-1 select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 text-muted-foreground/60 transition-transform duration-150 relative top-[3px] mr-0.5",
            expanded && "rotate-90",
          )}
        />
        {keyName !== undefined && (
          <>
            <span className="text-violet-500 dark:text-violet-400 shrink-0">&quot;{keyName}&quot;</span>
            <span className="text-muted-foreground mx-1">:</span>
          </>
        )}
        {expanded ? (
          <span className="text-muted-foreground">{openBrace}</span>
        ) : (
          <>
            <span className="text-muted-foreground">{openBrace}</span>
            {badge && (
              <span className="mx-1 rounded bg-muted px-1.5 py-0 text-[10px] text-muted-foreground font-medium">
                {badge}
              </span>
            )}
            <span className="text-muted-foreground">{closeBrace}{comma}</span>
          </>
        )}
      </div>
      {expanded && (
        <>
          <div className="ml-4 border-l border-border/40 pl-3">
            {entries.map(([k, v], i) => (
              <JsonNode
                key={k}
                keyName={isArray ? undefined : k}
                value={v}
                isLast={i === entries.length - 1}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
          <div className="flex items-baseline leading-7 px-1 -mx-1">
            <span className="text-muted-foreground ml-0">{closeBrace}{comma}</span>
          </div>
        </>
      )}
    </div>
  )
}

interface JsonViewerProps {
  data: unknown
  className?: string
  defaultExpanded?: boolean
}

export function JsonViewer({
  data,
  className,
  defaultExpanded = true,
}: JsonViewerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card font-mono text-[13px] p-4 overflow-auto",
        className,
      )}
    >
      <JsonNode
        value={data as JsonValue}
        isLast
        depth={0}
        defaultExpanded={defaultExpanded}
      />
    </div>
  )
}
