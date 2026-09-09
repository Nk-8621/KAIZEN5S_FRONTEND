import { apiClient } from "@/api/client"
import type { LoginRequest, LoginResponse, UserDto } from "@/types/auth"

export const authApi = {
  login: (request: LoginRequest) => apiClient.post<LoginResponse>("/api/auth/login", request),
  logout: () => apiClient.post<null>("/api/auth/logout"),
  getCurrentUser: () => apiClient.get<UserDto>("/api/auth/me"),
}
