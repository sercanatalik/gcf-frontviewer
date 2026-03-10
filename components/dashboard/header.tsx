import Link from "next/link"
import { TrueFocus } from "@/components/ui/true-focus"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1">
      <Link href="/" className="text-2xl font-bold tracking-tight no-underline">
        <TrueFocus
          sentence="GCF"
          blurAmount={0}
          borderColor="hsl(var(--foreground))"
          glowColor="hsl(var(--muted-foreground) / 0.6)"
          animationDuration={0.5}
          pauseBetweenAnimations={5}
        />  &nbsp; FrontView
      </Link>
    </div>
  )
}
