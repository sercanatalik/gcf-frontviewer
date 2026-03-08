"use client"

import { useRef } from "react"
import type { HTMLPerspectiveWorkspaceElement } from "@perspective-dev/workspace"
import { WorkspaceHeader } from "@/components/workspace/workspace-header"
import { LoadingScreen } from "@/components/workspace/loading-screen"
import { usePerspective } from "@/hooks/use-perspective"

export default function WorkspacePage() {
  const workspaceRef = useRef<HTMLPerspectiveWorkspaceElement>(null)
  const {
    ready,
    loading,
    layouts,
    activeLayout,
    switchLayout,
    exportLayout,
    importLayout,
    resetLayout,
  } = usePerspective(workspaceRef)

  return (
    <>
      {!ready && <LoadingScreen progress={loading} />}
      <div
        className={`${ready ? "flex" : "hidden"} absolute inset-0 flex-col bg-muted`}
      >
        <WorkspaceHeader
          layouts={layouts}
          activeLayout={activeLayout}
          onSwitchLayout={switchLayout}
          onExport={exportLayout}
          onImport={importLayout}
          onReset={resetLayout}
        />

        <div className="flex flex-1 overflow-hidden">
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
