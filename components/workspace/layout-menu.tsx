"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { HTMLPerspectiveWorkspaceElement } from "@perspective-dev/workspace"
import {
  LayoutGrid,
  LayoutDashboard,
  Table,
  ShieldCheck,
  Users,
  Shield,
  BarChart3,
  Globe,
  Layers,
  Save,
  RotateCcw,
  Trash2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { layoutPresets, type LayoutPreset, type WorkspaceLayout } from "./layout-presets"

const STORAGE_KEY = "perspective-workspace-state"
const CUSTOM_LAYOUTS_KEY = "perspective-custom-layouts"
const ACTIVE_LAYOUT_KEY = "perspective-active-layout"

const iconMap: Record<string, React.ReactNode> = {
  table: <Table className="size-4 text-blue-500" />,
  shield: <Shield className="size-4 text-red-500" />,
  users: <Users className="size-4 text-orange-500" />,
  "shield-check": <ShieldCheck className="size-4 text-emerald-500" />,
  "bar-chart": <BarChart3 className="size-4 text-violet-500" />,
  globe: <Globe className="size-4 text-cyan-500" />,
  layers: <Layers className="size-4 text-amber-500" />,
}

function getCustomLayouts(): LayoutPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LAYOUTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomLayouts(layouts: LayoutPreset[]) {
  localStorage.setItem(CUSTOM_LAYOUTS_KEY, JSON.stringify(layouts))
}

interface LayoutMenuProps {
  workspaceRef?: React.RefObject<HTMLPerspectiveWorkspaceElement | null>
  ready?: boolean
}

export function LayoutMenu({ workspaceRef, ready }: LayoutMenuProps) {
  const router = useRouter()
  const hasWorkspace = !!workspaceRef && !!ready

  const [activeLayout, setActiveLayout] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(ACTIVE_LAYOUT_KEY) ?? ""
  })
  const [customLayouts, setCustomLayouts] = useState<LayoutPreset[]>(() => {
    if (typeof window === "undefined") return []
    return getCustomLayouts()
  })
  const [savingName, setSavingName] = useState("")
  const [savingDescription, setSavingDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const applyLayout = useCallback(
    async (preset: LayoutPreset) => {
      setActiveLayout(preset.id)
      localStorage.setItem(ACTIVE_LAYOUT_KEY, preset.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.layout))

      const workspace = workspaceRef?.current
      if (workspace) {
        try {
          await workspace.restore(preset.layout)
        } catch (err) {
          console.error("Failed to apply layout:", err)
        }
      } else {
        router.push("/workspace")
      }
    },
    [workspaceRef, router],
  )

  const saveCurrentLayout = useCallback(async () => {
    const workspace = workspaceRef?.current
    if (!workspace || !savingName.trim()) return

    try {
      const state = await workspace.save()
      const id = `custom-${Date.now()}`
      const newPreset: LayoutPreset = {
        id,
        name: savingName.trim(),
        description: savingDescription.trim() || "Custom saved layout",
        icon: "table",
        layout: state as unknown as WorkspaceLayout,
      }

      const updated = [...customLayouts, newPreset]
      setCustomLayouts(updated)
      saveCustomLayouts(updated)
      setActiveLayout(id)
      localStorage.setItem(ACTIVE_LAYOUT_KEY, id)
      setSavingName("")
      setSavingDescription("")
      setIsSaving(false)
    } catch (err) {
      console.error("Failed to save layout:", err)
    }
  }, [workspaceRef, savingName, savingDescription, customLayouts])

  const deleteCustomLayout = useCallback(
    (id: string) => {
      const updated = customLayouts.filter((l) => l.id !== id)
      setCustomLayouts(updated)
      saveCustomLayouts(updated)
      if (activeLayout === id) {
        setActiveLayout("")
        localStorage.removeItem(ACTIVE_LAYOUT_KEY)
      }
    },
    [customLayouts, activeLayout],
  )

  const resetLayout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_LAYOUT_KEY)
    setActiveLayout("")
    const workspace = workspaceRef?.current
    if (workspace) {
      const defaultPreset = layoutPresets[0]
      if (defaultPreset) {
        await workspace.restore(defaultPreset.layout)
      }
    }
  }, [workspaceRef])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
        >
          <LayoutGrid className="size-4" />
          <span className="sr-only">Layout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Navigate</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4 text-indigo-500" />
              Dashboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Preset Layouts</DropdownMenuLabel>
        <DropdownMenuGroup>
          {layoutPresets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => applyLayout(preset)}
              className="flex items-center gap-2"
            >
              {iconMap[preset.icon] ?? (
                <LayoutGrid className="size-4 text-muted-foreground" />
              )}
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.description}
                </span>
              </div>
              {activeLayout === preset.id && (
                <Check className="size-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {customLayouts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Saved Layouts</DropdownMenuLabel>
            <DropdownMenuGroup>
              {customLayouts.map((preset) => (
                <DropdownMenuSub key={preset.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Save className="size-4 text-muted-foreground" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.description}
                      </span>
                    </div>
                    {activeLayout === preset.id && (
                      <Check className="size-3.5 text-primary" />
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => applyLayout(preset)}>
                      <LayoutGrid className="size-4" />
                      Apply
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteCustomLayout(preset.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {hasWorkspace && (
          <>
            <DropdownMenuSeparator />

            {isSaving ? (
              <div className="flex flex-col gap-1.5 px-1.5 py-1">
                <input
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSaving(false)
                      setSavingName("")
                      setSavingDescription("")
                    }
                  }}
                  placeholder="Name..."
                  autoFocus
                  className="h-7 rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="text"
                  value={savingDescription}
                  onChange={(e) => setSavingDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCurrentLayout()
                    if (e.key === "Escape") {
                      setIsSaving(false)
                      setSavingName("")
                      setSavingDescription("")
                    }
                  }}
                  placeholder="Description..."
                  className="h-7 rounded-md border bg-transparent px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full"
                  onClick={saveCurrentLayout}
                  disabled={!savingName.trim()}
                >
                  <Check className="size-3.5" />
                  Save
                </Button>
              </div>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  setIsSaving(true)
                }}
              >
                <Save className="size-4" />
                Save Current Layout
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={resetLayout}>
              <RotateCcw className="size-4" />
              Reset to Default
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
