"use client"

import { CSSProperties, ReactNode } from "react"

interface ShinyTextProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function ShinyText({
  children,
  className = "",
  speed = 3,
}: ShinyTextProps) {
  return (
    <span
      className={className}
      style={
        {
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage:
            "linear-gradient(90deg, var(--muted-foreground) 0%, var(--foreground) 25%, var(--muted-foreground) 50%, var(--foreground) 75%, var(--muted-foreground) 100%)",
          backgroundSize: "200% 100%",
          animation: `shiny-text ${speed}s infinite linear`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  )
}
