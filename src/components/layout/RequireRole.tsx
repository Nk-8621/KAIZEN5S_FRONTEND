import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { EmptyState } from "@/components/shared/EmptyState"

interface RequireRoleProps {
  roles: string[]
  children: ReactNode
}

/** Client-side route guard keyed to the role model (ANALYSIS.md §9) — the backend still
 * enforces every [Authorize(Roles=...)] independently; this only hides UI the user can't use. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { hasRole } = useAuth()

  if (!hasRole(...roles)) {
    return (
      <EmptyState
        title="You don't have access to this page"
        description={`This page is restricted to: ${roles.join(", ")}.`}
      />
    )
  }

  return <>{children}</>
}
