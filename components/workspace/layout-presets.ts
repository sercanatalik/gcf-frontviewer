import { F } from "@/lib/field-defs"

// Matches PerspectiveWorkspaceConfig from @perspective-dev/workspace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WorkspaceLayout {
  sizes: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewers: Record<string, any>
  detail: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    main: any
  }
  master?: {
    sizes: number[]
    widgets: string[]
  }
}

export interface LayoutPreset {
  id: string
  name: string
  description: string
  icon: string
  layout: WorkspaceLayout
}

const TABLE = "gcf_risk_mv"

// ── Helper: single-viewer layout ─────────────────────────────────────
function singleViewer(id: string): WorkspaceLayout["detail"] {
  return {
    main: { type: "tab-area", widgets: [id], currentIndex: 0 },
  }
}

// ── Helper: 2×1 horizontal split ─────────────────────────────────────
function hSplit(
  left: string[],
  right: string[],
  sizes: [number, number] = [0.5, 0.5],
): WorkspaceLayout["detail"]["main"] {
  return {
    type: "split-area",
    orientation: "horizontal",
    children: [
      { type: "tab-area", widgets: left, currentIndex: 0 },
      { type: "tab-area", widgets: right, currentIndex: 0 },
    ],
    sizes,
  }
}

// ── Helper: 2×1 vertical split (top / bottom) ────────────────────────
function vSplit(
  top: WorkspaceLayout["detail"]["main"],
  bottom: WorkspaceLayout["detail"]["main"],
  sizes: [number, number] = [0.5, 0.5],
): WorkspaceLayout["detail"]["main"] {
  return {
    type: "split-area",
    orientation: "vertical",
    children: [top, bottom],
    sizes,
  }
}

function tabs(...ids: string[]): WorkspaceLayout["detail"]["main"] {
  return { type: "tab-area", widgets: ids, currentIndex: 0 }
}

// Suppress unused warnings — helpers will be used as presets are added
void hSplit
void vSplit
void tabs
void F

// =====================================================================
export const layoutPresets: LayoutPreset[] = [
  // ── 1. Overview ────────────────────────────────────────────────────
  {
    id: "overview",
    name: "Overview",
    description: "",
    icon: "table",
    layout: {
      sizes: [1],
      detail: singleViewer("v-overview"),
      viewers: {
        "v-overview": {
          plugin: "Datagrid",
          table: TABLE,
          title: "gcf_risk_mv",
          columns: [],
          sort: [],
          group_by: [],
          split_by: [],
          filter: [],
          expressions: {},
          aggregates: {},
        },
      },
    },
  },
]
