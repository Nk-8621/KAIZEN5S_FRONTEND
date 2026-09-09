import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi } from "@/api/auth"
import { clearStoredToken, getStoredToken, storeToken } from "@/api/client"
import type { LoginRequest, UserDto } from "@/types/auth"

interface AuthContextValue {
  user: UserDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch {
      clearStoredToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const login = useCallback(async (request: LoginRequest) => {
    const loginResult = await authApi.login(request)
    storeToken(loginResult.token)
    setUser(loginResult.user)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
    authApi.logout().catch(() => {
      // Logout is symmetry-only (JWTs are stateless) — a failed call here doesn't matter.
    })
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!user) {
        return false
      }
      const matchesAnyRole = roles.some((role) => user.roles.includes(role))
      return matchesAnyRole
    },
    [user],
  )

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.")
  }
  return context
}
