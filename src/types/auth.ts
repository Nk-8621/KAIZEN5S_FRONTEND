export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAtUtc: string
  user: UserDto
}

export interface UserDto {
  userId: number
  fullName: string
  email: string
  jobPosition: string | null
  siteId: number | null
  roles: string[]
}
