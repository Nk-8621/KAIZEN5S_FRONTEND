import { NavLink } from "react-router-dom"
import {
  AlertTriangle,
  ClipboardCheck,
  Eye,
  Gauge,
  Lightbulb,
  ListChecks,
  Settings,
  ShieldAlert,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/** One consistent left-sidebar shell across all 5 modules — ANALYSIS.md §9's one deliberate UI change. */
const NAV_ITEMS: NavItem[] = [
  { to: "/kaizen", label: "Quick Kaizens", icon: Lightbulb },
  { to: "/five-s", label: "5S Audit", icon: ListChecks },
  { to: "/incidents", label: "Safety Incidents", icon: AlertTriangle },
  { to: "/observations", label: "Safety Observations", icon: Eye },
  { to: "/assessments", label: "Safety Assessment", icon: ClipboardCheck },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-5">
        <Gauge className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-semibold text-white">BuildApp</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/60">
        <ShieldAlert className="h-4 w-4" />
        <span>Manufacturing Excellence Platform</span>
      </div>
    </aside>
  )
}
