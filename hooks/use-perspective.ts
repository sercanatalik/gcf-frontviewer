"use client"

import { useEffect, useRef, useState } from "react"
import type { HTMLPerspectiveWorkspaceElement } from "@perspective-dev/workspace"
import type { LoadingProgress, EnrichedTableInfo } from "@/lib/types"
import { fetchTables, fetchAllTableData, fetchDailySummary } from "@/lib/api"
import type { SerializedFilter } from "@/lib/filters/serialize"
import { useFiltersParam } from "@/hooks/use-filters-param"
import { basePath } from "@/lib/utils"

const STORAGE_KEY = "perspective-workspace-state"
const LAYOUT_VERSION_KEY = "perspective-layout-version"
const LAYOUT_VERSION = 2 // bump to invalidate stale layouts

const INITIAL_PROGRESS: LoadingProgress = {
  phase: "init-wasm",
  tablesTotal: 0,
  tablesLoaded: 0,
  currentTable: "",
}

// Global state that survives soft navigations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedClient: any = null
let cachedTables: EnrichedTableInfo[] = []
let wasmInitPromise: Promise<void> | null = null

async function initWasm() {
  if (wasmInitPromise) return wasmInitPromise
  wasmInitPromise = (async () => {
    await import("@perspective-dev/viewer-datagrid")
    await import("@perspective-dev/viewer-d3fc")
    await import("@perspective-dev/viewer")
    await import("@perspective-dev/workspace")

    const perspective = (await import("@perspective-dev/client")).default
    const viewer = await import("@perspective-dev/viewer")
    perspective.init_client(fetch(`${basePath}/perspective-js.wasm`))
    perspective.init_server(fetch(`${basePath}/perspective-server.wasm`))
    await viewer.init_client(fetch(`${basePath}/perspective-viewer.wasm`))
    cachedClient = await perspective.worker()
  })()
  return wasmInitPromise
}

/** Keep only filters whose field exists as a column in the table. */
function filterParamForTable(
  filtersParam: string,
  tableInfo: EnrichedTableInfo
): string | undefined {
  if (!filtersParam) return undefined
  try {
    const parsed: SerializedFilter[] = JSON.parse(filtersParam)
    const colNames = new Set(tableInfo.columns.map((c) => c.name))
    const applicable = parsed.filter((f) => colNames.has(f.field))
    if (applicable.length === 0) return undefined
    return JSON.stringify(applicable)
  } catch {
    return undefined
  }
}

function buildDefaultLayout(tables: EnrichedTableInfo[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewers: Record<string, any> = {}

  if (tables.length > 0) {
    const first = tables[0]!
    const cols = first.columns.slice(0, 10).map((c) => c.name)
    viewers["viewer-0"] = {
      plugin: "Datagrid",
      columns: cols,
      table: first.name,
    }
  }

  if (tables.length === 0) {
    return { sizes: [], viewers, detail: { main: null } }
  }

  return {
    sizes: [],
    viewers,
    detail: {
      main: {
        type: "tab-area" as const,
        widgets: ["viewer-0"],
        currentIndex: 0,
      },
    },
  }
}

function coerceRows(
  rows: Record<string, unknown>[],
  colTypes: Map<string, string>
) {
  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      if (val == null) continue
      const pType = colTypes.get(key)
      if (!pType) continue
      switch (pType) {
        case "string":
          if (typeof val !== "string") row[key] = String(val)
          break
        case "datetime":
          row[key] = new Date(val as string | number)
          break
        case "integer":
          if (typeof val === "string") row[key] = parseInt(val, 10)
          break
        case "float":
          if (typeof val === "string") row[key] = parseFloat(val)
          break
        case "boolean":
          if (typeof val !== "boolean") row[key] = Boolean(val)
          break
      }
    }
  }
  return rows
}

export function usePerspective(
  workspaceRef: React.RefObject<HTMLPerspectiveWorkspaceElement | null>
) {
  const [loading, setLoading] = useState<LoadingProgress>(INITIAL_PROGRESS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null)
  const tablesRef = useRef<EnrichedTableInfo[]>([])
  const filtersParam = useFiltersParam()

  useEffect(() => {

    let cancelled = false

    const suppressPerspectiveErrors = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? String(event.reason ?? "")
      if (msg.includes("View not found") || msg.includes("innerHTML")) {
        event.preventDefault()
      }
    }
    const suppressDomErrors = (event: ErrorEvent) => {
      const msg = event.message ?? ""
      if (msg.includes("innerHTML") || msg.includes("View not found")) {
        event.preventDefault()
      }
    }
    window.addEventListener("unhandledrejection", suppressPerspectiveErrors)
    window.addEventListener("error", suppressDomErrors)

    async function setup() {
      try {
        // Phase 1: Init WASM (cached globally)
        setLoading({ ...INITIAL_PROGRESS, phase: "init-wasm" })
        await initWasm()
        const client = cachedClient
        clientRef.current = client
        if (cancelled) return

        // Phase 2: Fetch schemas (use cache if available)
        setLoading((p) => ({ ...p, phase: "fetch-schemas" }))

        let tables: EnrichedTableInfo[]
        if (cachedTables.length > 0) {
          tables = cachedTables
        } else {
          const result = await fetchTables()
          tables = result.tables
          cachedTables = tables
        }
        tablesRef.current = tables
        if (cancelled) return

        // Phase 3: Load tables
        setLoading((p) => ({
          ...p,
          phase: "load-tables",
          tablesTotal: tables.length,
          tablesLoaded: 0,
        }))

        for (let i = 0; i < tables.length; i++) {
          const tableInfo = tables[i]!
          if (cancelled) return

          setLoading((p) => ({
            ...p,
            currentTable: tableInfo.name,
            tablesLoaded: i,
          }))

          const colTypes = new Map<string, string>()
          for (const col of tableInfo.columns) {
            colTypes.set(col.name, col.perspectiveType)
          }

          // Try to open existing table, create if it doesn't exist
          let tbl
          try {
            tbl = await client.open_table(tableInfo.name)
          } catch {
            const schema: Record<string, string> = {}
            for (const col of tableInfo.columns) {
              schema[col.name] = col.perspectiveType
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await client.table(schema as any, { name: tableInfo.name })
            tbl = await client.open_table(tableInfo.name)
          }

          const tableFilters = filterParamForTable(filtersParam, tableInfo)
          const rows = await fetchAllTableData(tableInfo.name, {
            asOfDate: tableInfo.hasAsOfDate ? "__latest__" : undefined,
            filters: tableFilters,
          })

          coerceRows(rows, colTypes)

          if (rows.length > 0) {
            await tbl.replace(rows)
          }
        }

        setLoading((p) => ({
          ...p,
          tablesLoaded: tables.length,
        }))

        // Load daily summary virtual table (gcf_risk_mv grouped by asOfDate)
        {
          const DAILY_SUMMARY_TABLE = "gcf_daily_summary"
          const dailySummarySchema: Record<string, string> = {
            asOfDate: "datetime",
            cashOut: "float",
            fundingAmount: "float",
            collateralAmount: "float",
          }

          let dsTbl
          try {
            dsTbl = await client.open_table(DAILY_SUMMARY_TABLE)
          } catch {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await client.table(dailySummarySchema as any, {
              name: DAILY_SUMMARY_TABLE,
            })
            dsTbl = await client.open_table(DAILY_SUMMARY_TABLE)
          }

          const dsFilters = filtersParam || undefined
          const dsRows = await fetchDailySummary({ filters: dsFilters })

          const dsColTypes = new Map<string, string>(
            Object.entries(dailySummarySchema),
          )
          coerceRows(dsRows, dsColTypes)

          if (dsRows.length > 0) {
            await dsTbl.replace(dsRows)
          }
        }

        // Phase 4: Restore workspace
        if (cancelled) return
        setLoading((p) => ({ ...p, phase: "restore-layout" }))

        await customElements.whenDefined("perspective-workspace")
        const workspace = workspaceRef.current
        if (!workspace) return

        await workspace.load(client)

        // --- Perspective bug patches ---
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wsInternal = (workspace as any).workspace
        if (wsInternal) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cmdMap = (wsInternal.commands as any)?._commands as
            | Map<
                string,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                any
              >
            | undefined
          if (cmdMap) {
            const patchLabel = (id: string, fallback: string) => {
              const cmd = cmdMap.get(id)
              if (!cmd) return
              const orig = cmd.label
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cmd.label = (...a: any[]) => {
                try {
                  return orig(...a)
                } catch {
                  return fallback
                }
              }
            }
            patchLabel("workspace:master", "Global Filter")
            patchLabel("workspace:settings", "Settings")
            patchLabel("workspace:newview", "View")
          }

          if (wsInternal.commands) {
            wsInternal.commands.addCommand("workspace:maximize", {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              execute: ({ widget_name }: any) => {
                const w = wsInternal.getWidgetByName(widget_name)
                if (w) wsInternal.toggleSingleDocument(w)
              },
              label: () =>
                wsInternal.dockpanel.mode === "single-document"
                  ? "Restore"
                  : "Maximize",
              mnemonic: 0,
            })

            const origCreateCtx =
              wsInternal.createContextMenu.bind(wsInternal)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            wsInternal.createContextMenu = (widget: any) => {
              const menu = origCreateCtx(widget)
              if (widget) {
                const widget_name = widget.viewer.getAttribute("slot")
                menu.insertItem(menu.items.length - 2, {
                  command: "workspace:maximize",
                  args: { widget_name },
                })
              }
              return menu
            }
          }

          const MAXIMIZE_SVG =
            "data:image/svg+xml," +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>'
            )
          const RESTORE_SVG =
            "data:image/svg+xml," +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
            )

          function injectMaximizeButton(viewer: Element) {
            const shadow = viewer.shadowRoot
            if (!shadow || shadow.querySelector("#maximize_button")) return

            const settingsBtn = shadow.querySelector("#settings_button")
            if (!settingsBtn) return

            const style = document.createElement("style")
            style.textContent = `
              #maximize_button {
                background-color: var(--plugin--background);
                padding: 0;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                border: 1px solid var(--inactive--color);
                border-radius: 5px;
                font-size: 10px;
                font-weight: normal;
                cursor: pointer;
              }
              #maximize_button:hover {
                color: var(--plugin--background, inherit);
                background-color: var(--icon--color);
              }
              #maximize_button:hover:before {
                background-color: var(--plugin--background);
              }
              #maximize_button:before {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                background-color: var(--icon--color);
                mask-size: cover;
                -webkit-mask-size: cover;
                background-repeat: no-repeat;
                -webkit-mask-image: var(--maximize-icon);
                mask-image: var(--maximize-icon);
              }
            `
            shadow.appendChild(style)

            const maxBtn = document.createElement("div")
            maxBtn.id = "maximize_button"
            maxBtn.className = "noselect"
            const isMax = wsInternal.dockpanel.mode === "single-document"
            maxBtn.style.setProperty(
              "--maximize-icon",
              `url("${isMax ? RESTORE_SVG : MAXIMIZE_SVG}")`
            )
            const closeBtn = shadow.querySelector("#close_button")
            if (closeBtn) {
              closeBtn.before(maxBtn)
            } else {
              settingsBtn.after(maxBtn)
            }

            maxBtn.addEventListener("mousedown", (e) => {
              e.stopPropagation()
              e.preventDefault()
              const slotName = viewer.getAttribute("slot")
              const w = slotName
                ? wsInternal.getWidgetByName(slotName)
                : null
              if (w) wsInternal.toggleSingleDocument(w)

              const nowMax =
                wsInternal.dockpanel.mode === "single-document"
              workspace!.querySelectorAll("perspective-viewer").forEach(
                (v: Element) => {
                  const btn = v.shadowRoot?.querySelector(
                    "#maximize_button"
                  ) as HTMLElement | null
                  if (btn) {
                    btn.style.setProperty(
                      "--maximize-icon",
                      `url("${nowMax ? RESTORE_SVG : MAXIMIZE_SVG}")`
                    )
                  }
                }
              )
            })
          }

          workspace
            .querySelectorAll("perspective-viewer")
            .forEach((v: Element) => injectMaximizeButton(v))

          const maximizeObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
              for (const node of m.addedNodes) {
                if (!(node instanceof HTMLElement)) continue
                if (node.tagName === "PERSPECTIVE-VIEWER") {
                  injectMaximizeButton(node)
                }
                node
                  .querySelectorAll("perspective-viewer")
                  .forEach((v) => injectMaximizeButton(v))
              }
            }
          })
          maximizeObserver.observe(workspace, {
            childList: true,
            subtree: true,
          })
        }

        const storedVersion = Number(localStorage.getItem(LAYOUT_VERSION_KEY) ?? 0)
        const saved = storedVersion === LAYOUT_VERSION
          ? localStorage.getItem(STORAGE_KEY)
          : null

        if (storedVersion !== LAYOUT_VERSION) {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.setItem(LAYOUT_VERSION_KEY, String(LAYOUT_VERSION))
        }

        if (saved) {
          try {
            await workspace.restore(JSON.parse(saved))
          } catch {
            const layout = buildDefaultLayout(tables)
            await workspace.restore(layout)
          }
        } else {
          const layout = buildDefaultLayout(tables)
          await workspace.restore(layout)
        }

        workspace.addEventListener("workspace-layout-update", async () => {
          try {
            const state = await workspace.save()
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
          } catch {
            /* ignore */
          }
        })

        if (!cancelled) {
          setLoading((p) => ({ ...p, phase: "done" }))
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        // "View not found" is a transient Perspective error — not fatal
        if (msg === "View not found") return
        if (!cancelled) {
          setLoading((p) => ({ ...p, error: msg }))
        }
      }
    }

    setup()
    return () => {
      cancelled = true
      // Defer removal so async Perspective errors that fire after
      // unmount (e.g. navigating away) are still suppressed.
      setTimeout(() => {
        window.removeEventListener("unhandledrejection", suppressPerspectiveErrors)
        window.removeEventListener("error", suppressDomErrors)
      }, 2000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch and replace table data when filters change after init
  const prevFiltersRef = useRef(filtersParam)
  useEffect(() => {
    if (prevFiltersRef.current === filtersParam) return
    prevFiltersRef.current = filtersParam

    const client = clientRef.current
    const tables = tablesRef.current
    if (!client || tables.length === 0 || loading.phase !== "done") return

    let cancelled = false

    async function reload() {
      for (const tableInfo of tables) {
        if (cancelled) return

        const colTypes = new Map<string, string>()
        for (const col of tableInfo.columns) {
          colTypes.set(col.name, col.perspectiveType)
        }

        const tableFilters = filterParamForTable(filtersParam, tableInfo)
        const rows = await fetchAllTableData(tableInfo.name, {
          asOfDate: tableInfo.hasAsOfDate ? "__latest__" : undefined,
          filters: tableFilters,
        })

        if (cancelled) return
        coerceRows(rows, colTypes)

        const tbl = await client.open_table(tableInfo.name)
        await tbl.replace(rows)
      }

      // Reload daily summary virtual table
      if (cancelled) return
      const dsRows = await fetchDailySummary({
        filters: filtersParam || undefined,
      })
      const dsColTypes = new Map<string, string>([
        ["asOfDate", "datetime"],
        ["cashOut", "float"],
        ["fundingAmount", "float"],
        ["collateralAmount", "float"],
      ])
      coerceRows(dsRows, dsColTypes)
      const dsTbl = await client.open_table("gcf_daily_summary")
      await dsTbl.replace(dsRows)
    }

    reload()
    return () => {
      cancelled = true
    }
  }, [filtersParam, loading.phase])

  return {
    ready: loading.phase === "done",
    loading,
  }
}
