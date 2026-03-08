import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/gcf-frontview"

/** Sanitize a string for use as a chart data key (replace non-alphanumeric chars). */
export function sanitizeKey(key: string): string {
  return String(key).replace(/[^a-zA-Z0-9]/g, "_")
}
