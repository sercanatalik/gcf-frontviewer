import { TrueFocus } from "@/components/ui/true-focus"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">
        <TrueFocus
          sentence="GCF-Frontview"
          blurAmount={0}
          borderColor="hsl(var(--foreground))"
          glowColor="hsl(var(--muted-foreground) / 0.6)"
          animationDuration={0.5}
          pauseBetweenAnimations={5}
        />
      </h1>
    </div>
  )
}
