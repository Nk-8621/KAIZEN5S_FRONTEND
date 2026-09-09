import type { ApiResponse, PagedRequest } from "@/types/common"

/**
 * Base URL for BuildApp.Api. Set VITE_API_BASE_URL in a .env(.local) file — see .env.example.
 * Falls back to the common local `dotnet run` port so `npm run dev` works out of the box.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5063"

const TOKEN_STORAGE_KEY = "buildapp.token"

/** Reads the current JWT from storage, or null if the user isn't logged in. */
export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return token
}

/** Persists the JWT after a successful login. */
export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/** Clears the JWT on logout. */
export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/** Thrown when the API returns a non-2xx status or an envelope with success: false. */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly errors: string[]

  constructor(message: string, statusCode: number, errors: string[]) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.errors = errors
  }
}

/** Builds the common headers every request sends: JSON content type + bearer token, when present. */
function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  const token = getStoredToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

/** Appends query-string parameters, skipping null/undefined/empty-string values. */
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) {
    return ""
  }

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const shouldSkip = value === null || value === undefined || value === ""
    if (!shouldSkip) {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

/** Unwraps the ApiResponse<T> envelope and throws ApiError on failure, so callers just get T back. */
async function unwrapResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false
  const body = isJson ? ((await response.json()) as ApiResponse<T>) : null

  if (!response.ok || !body || !body.success) {
    const message = body?.message ?? `Request failed with status ${response.status}.`
    const errors = body?.errors ?? []
    throw new ApiError(message, response.status, errors)
  }

  return body.data
}

interface RequestOptions {
  query?: Record<string, unknown>
  body?: unknown
}

async function request<T>(method: string, path: string, options?: RequestOptions): Promise<T> {
  const queryString = buildQueryString(options?.query)
  const url = `${API_BASE_URL}${path}${queryString}`

  const init: RequestInit = {
    method,
    headers: buildHeaders(),
  }
  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, init)
  const data = await unwrapResponse<T>(response)
  return data
}

/** Thin, resource-agnostic HTTP wrapper. Every api/*.ts module calls through this. */
export const apiClient = {
  get: <T>(path: string, query?: Record<string, unknown>) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown, query?: Record<string, unknown>) => request<T>("POST", path, { body, query }),
  put: <T>(path: string, body?: unknown, query?: Record<string, unknown>) => request<T>("PUT", path, { body, query }),
  delete: <T>(path: string, query?: Record<string, unknown>) => request<T>("DELETE", path, { query }),
}

/** Flattens a PagedRequest into query-string params (page/pageSize). */
export function pagingToQuery(paging: PagedRequest): Record<string, unknown> {
  const query = { page: paging.page, pageSize: paging.pageSize }
  return query
}
