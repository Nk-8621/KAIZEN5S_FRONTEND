import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

interface ModuleTabItem {
  to: string
  label: string
  end?: boolean
}

/**
 * A module's own secondary navigation bar (ANALYSIS.md §9 / §3.5 — "each module keeps its own
 * sub-navigation" beneath the shared left sidebar). Used by modules with more than one screen
 * reachable outside of a record's own detail page — 5S has Questionnaires/Audits/Dashboard,
 * Incident/Observation/Assessment will follow the same pattern.
 */
export function ModuleTabs({ items }: { items: ModuleTabItem[] }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
