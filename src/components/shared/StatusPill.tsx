import { Badge } from "@/components/ui/badge"
import { humanizeStatus } from "@/lib/utils"

/**
 * Maps every workflow status word used across the 5 modules to one of the reserved status
 * colors (good/warning/serious→destructive/critical→destructive) — see dataviz skill's status
 * palette. Status color is never the sole signal: the label text always renders alongside it.
 */
function variantForStatus(status: string): "success" | "warning" | "destructive" | "secondary" | "muted" {
  const normalized = status.toLowerCase()

  const isSuccess =
    normalized.includes("approved") ||
    normalized.includes("completed") ||
    normalized.includes("closed") ||
    normalized.includes("done") ||
    normalized.includes("reviewed") ||
    normalized === "confirmed"
  if (isSuccess) {
    return "success"
  }

  const isDestructive = normalized.includes("reject") || normalized.includes("notfeasible") || normalized.includes("redo")
  if (isDestructive) {
    return "destructive"
  }

  const isWarning =
    normalized.includes("pending") ||
    normalized.includes("progress") ||
    normalized.includes("review") ||
    normalized.includes("check") ||
    normalized.includes("requested") ||
    normalized.includes("assigned") ||
    normalized.includes("reopened") ||
    normalized.includes("submitted")
  if (isWarning) {
    return "warning"
  }

  const isOpenOrCreated = normalized.includes("open") || normalized.includes("created")
  if (isOpenOrCreated) {
    return "secondary"
  }

  return "muted"
}

export function StatusPill({ status }: { status: string }) {
  const variant = variantForStatus(status)
  const label = humanizeStatus(status)
  return <Badge variant={variant}>{label}</Badge>
}
