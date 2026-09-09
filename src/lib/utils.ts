import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merges Tailwind class lists, letting later classes override earlier ones cleanly. */
export function cn(...inputs: ClassValue[]) {
  const merged = twMerge(clsx(inputs))
  return merged
}

/** Formats a currency amount using the app's default currency (ANALYSIS.md §11 item 11 — configurable, default INR). */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
  return formatted
}

/** Formats an ISO date string as a short, readable date. Returns a placeholder for null/undefined. */
export function formatDate(value?: string | null): string {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  const formatted = date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
  return formatted
}

/** Formats an ISO date string as a readable date + time. Returns a placeholder for null/undefined. */
export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  const formatted = date.toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  return formatted
}

/** Converts a PascalCase/camelCase status word into a human-readable label (e.g. "InReview" -> "In Review"). */
export function humanizeStatus(status: string): string {
  const withSpaces = status.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return withSpaces
}
