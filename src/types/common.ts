/**
 * Wire-level envelope types shared by every endpoint. Field names are camelCase because
 * ASP.NET Core's default System.Text.Json policy for [ApiController] responses is camelCase
 * (see BuildApp.Services.Helpers.ApiResponse<T> on the backend).
 */
export interface ApiResponse<T> {
  success: boolean
  message: string | null
  errors: string[]
  data: T
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PagedRequest {
  page: number
  pageSize: number
}

export const DEFAULT_PAGE_SIZE = 20

export function defaultPaging(): PagedRequest {
  const paging = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
  return paging
}
