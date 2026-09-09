import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: "default" | "success" | "warning" | "destructive"
  className?: string
}

const toneClasses: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
}

/** A single labeled number — the "stat tile" pattern used across every module's dashboard. */
export function StatTile({ label, value, icon, tone = "default", className }: StatTileProps) {
  const valueClassName = cn("text-2xl font-semibold tabular-nums", toneClasses[tone])
  const combinedClassName = cn(className)

  return (
    <Card className={combinedClassName}>
      <CardContent className="flex items-center justify-between p-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className={valueClassName}>{value}</span>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardContent>
    </Card>
  )
}
