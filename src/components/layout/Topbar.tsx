import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-border bg-background px-6">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{user?.fullName}</span>
        <span className="text-muted-foreground">· {user?.roles.join(", ")}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </header>
  )
}
