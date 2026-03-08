"use client"

import { motion, AnimatePresence } from "motion/react"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { ShinyText } from "@/components/ui/shiny-text"
import type { LoadingProgress, LoadingPhase } from "@/lib/types"

const PHASES: { key: LoadingPhase; label: string }[] = [
  { key: "init-wasm", label: "Initializing runtime" },
  { key: "fetch-schemas", label: "Fetching schemas" },
  { key: "load-tables", label: "Loading data" },
  { key: "restore-layout", label: "Restoring layout" },
]

const PHASE_ORDER: LoadingPhase[] = [
  "init-wasm",
  "fetch-schemas",
  "load-tables",
  "restore-layout",
  "done",
]

function getPhaseStatus(
  phase: LoadingPhase,
  current: LoadingPhase
): "done" | "active" | "pending" {
  const ci = PHASE_ORDER.indexOf(current)
  const pi = PHASE_ORDER.indexOf(phase)
  if (pi < ci) return "done"
  if (pi === ci) return "active"
  return "pending"
}

interface LoadingScreenProps {
  progress: LoadingProgress
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const progressPct =
    progress.tablesTotal > 0
      ? Math.round((progress.tablesLoaded / progress.tablesTotal) * 100)
      : 0

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <ShinyText className="text-sm font-semibold tracking-widest uppercase" speed={4}>
            GCF Workspace
          </ShinyText>
        </div>

        <div className="space-y-1">
          {PHASES.map(({ key, label }, i) => {
            const status = getPhaseStatus(key, progress.phase)
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex items-center gap-3 rounded-md px-3 py-2"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait">
                    {status === "done" && (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-3">
                          <Check size={12} className="text-primary-foreground" strokeWidth={3} />
                        </div>
                      </motion.div>
                    )}
                    {status === "active" && (
                      <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2
                          size={16}
                          className="animate-spin text-chart-1"
                        />
                      </motion.div>
                    )}
                    {status === "pending" && (
                      <motion.div
                        key="pending"
                        className="h-1.5 w-1.5 rounded-full bg-border"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    status === "done"
                      ? "text-foreground"
                      : status === "active"
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {label}
                  {key === "load-tables" &&
                    status === "active" &&
                    progress.currentTable && (
                      <span className="ml-1.5 text-muted-foreground">
                        {progress.tablesLoaded}/{progress.tablesTotal}
                      </span>
                    )}
                </span>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence>
          {progress.phase === "load-tables" && progress.tablesTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 px-3"
            >
              <div className="h-1 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--chart-1), var(--chart-3), var(--chart-5))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="mt-1.5 text-right text-[10px] text-muted-foreground">
                {progressPct}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {progress.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{progress.error}</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
