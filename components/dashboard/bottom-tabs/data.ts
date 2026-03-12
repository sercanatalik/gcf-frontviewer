export interface TabDef {
  key: string
  label: string
  groupBy: string
  groupLabel: string
  limit?: number
}

export { bottomTabs as tabs } from "@/lib/field-defs"
