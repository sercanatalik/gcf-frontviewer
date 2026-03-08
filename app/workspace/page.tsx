"use client"

import { useRef } from "react"
import type { HTMLPerspectiveWorkspaceElement } from "@perspective-dev/workspace"
import { DashboardHeader } from "@/components/dashboard/header"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { LoadingScreen } from "@/components/workspace/loading-screen"
import { LayoutMenu } from "@/components/workspace/layout-menu"
import { usePerspective } from "@/hooks/use-perspective"

export default function WorkspacePage() {
  const workspaceRef = useRef<HTMLPerspectiveWorkspaceElement>(null)
  const { ready, loading } = usePerspective(workspaceRef)

  return (
    <>
      <div className="absolute inset-0 flex flex-col bg-muted">
        <div className="flex shrink-0 items-start justify-between border-b bg-background px-5 py-4">
          <DashboardHeader />
          <div className="flex items-center gap-2">
            <LayoutMenu workspaceRef={workspaceRef} ready={ready} />
            <FilterBar />
          </div>
        </div>

        {!ready && <LoadingScreen progress={loading} />}
        <div className={`${ready ? "flex" : "hidden"} flex-1 overflow-hidden`}>
          <perspective-workspace
            ref={workspaceRef}
            id="psp_workspace"
            className="flex-1 overflow-hidden border border-border"
          />
        </div>
      </div>
    </>
  )
}
