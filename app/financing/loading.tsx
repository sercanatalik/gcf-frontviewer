"use client"

import { motion } from "motion/react"
import { TrueFocus } from "@/components/ui/true-focus"
import { ShinyText } from "@/components/ui/shiny-text"

const BAR_HEIGHTS = [35, 55, 42, 68, 30, 50, 60, 38, 72, 48, 58, 40]

function PulseBlock({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`}
    />
  )
}

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col gap-5 p-5 lg:p-6">
      {/* Header + Filter bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-1"
        >
          <div className="text-2xl font-bold tracking-tight">
            <TrueFocus
              sentence="GCF"
              blurAmount={0}
              borderColor="hsl(var(--foreground))"
              glowColor="hsl(var(--muted-foreground) / 0.6)"
              animationDuration={0.5}
              pauseBetweenAnimations={2}
            />
            &nbsp; FrontView
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </motion.div>
      </div>

      {/* KPI Cards - 7 cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.1 + i * 0.06,
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div
              className="h-7 w-24 animate-pulse rounded bg-muted"
              style={{ animationDelay: `${i * 80}ms` }}
            />
            <div className="h-3 w-14 animate-pulse rounded bg-muted/60" />
          </motion.div>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left column - Charts area */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Radial charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4"
              >
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <motion.div
                  className="relative h-24 w-24"
                  initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      className="stroke-muted"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      className="stroke-chart-2"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${251.2 * 0.7} ${251.2 * 0.3}`}
                      strokeDashoffset="0"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * 0.3 }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        duration: 1,
                        ease: "easeOut",
                      }}
                      style={{ opacity: 0.3 }}
                    />
                  </svg>
                </motion.div>
              </div>
            ))}
          </motion.div>

          {/* Stats row */}
          <PulseBlock className="h-16" delay={0.6} />

          {/* Cash Out Chart skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
            <div className="flex h-[300px] items-end gap-2 pt-4">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="flex h-full flex-1 flex-col justify-end">
                  <motion.div
                    className="w-full rounded-t-md"
                    style={{
                      background:
                        "linear-gradient(to top, var(--chart-4), var(--chart-1))",
                      opacity: 0.2,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      delay: 0.9 + i * 0.05,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column - Recent Trades skeleton */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex w-full flex-col gap-3 rounded-lg border bg-card p-4 lg:w-[380px]"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
          {/* Mini KPI stats */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md bg-muted/50 p-2">
                <div
                  className="mb-1 h-2 w-10 animate-pulse rounded bg-muted"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          {/* Trade list items */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.07, duration: 0.3 }}
              className="flex items-center gap-3 rounded-md border-b border-border/50 py-3 last:border-0"
            >
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/60" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Risk Analysis Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PulseBlock className="h-48" delay={0.9} />
        <PulseBlock className="h-48" delay={0.95} />
      </div>

      {/* Bottom Tabs skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="rounded-lg border bg-card p-4"
      >
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-md bg-muted"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-muted/40"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating loading indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-2.5 rounded-full border bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm">
          <motion.div
            className="h-2 w-2 rounded-full bg-chart-1"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <ShinyText className="text-xs font-medium tracking-wide" speed={2}>
            Loading financing data
          </ShinyText>
        </div>
      </motion.div>
    </div>
  )
}
