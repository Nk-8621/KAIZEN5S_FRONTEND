import { apiClient, pagingToQuery } from "@/api/client"
import type { PagedRequest, PagedResult } from "@/types/common"
import type {
  ApproveKaizenRequest,
  CloseKaizenRequest,
  CreateKaizenRequest,
  FeasibilityRequest,
  KaizenCostDto,
  KaizenDashboardDto,
  KaizenDetailDto,
  KaizenListFilter,
  KaizenListItemDto,
  KaizenSavingDto,
  RejectKaizenRequest,
  RequestInfoRequest,
  UpdateKaizenRequest,
  UpsertKaizenCostRequest,
  UpsertKaizenSavingRequest,
} from "@/types/kaizen"

export const kaizenApi = {
  getList: (paging: PagedRequest, filter: KaizenListFilter) =>
    apiClient.get<PagedResult<KaizenListItemDto>>("/api/kaizens", { ...pagingToQuery(paging), ...filter }),

  getDashboard: (filter: KaizenListFilter) => apiClient.get<KaizenDashboardDto>("/api/kaizens/dashboard", { ...filter }),

  getById: (id: number) => apiClient.get<KaizenDetailDto>(`/api/kaizens/${id}`),

  create: (request: CreateKaizenRequest) => apiClient.post<KaizenDetailDto>("/api/kaizens", request),

  update: (id: number, request: UpdateKaizenRequest) => apiClient.put<KaizenDetailDto>(`/api/kaizens/${id}`, request),

  requestInfo: (id: number, request: RequestInfoRequest) => apiClient.post<KaizenDetailDto>(`/api/kaizens/${id}/request-info`, request),

  approve: (id: number, request: ApproveKaizenRequest) => apiClient.post<KaizenDetailDto>(`/api/kaizens/${id}/approve`, request),

  reject: (id: number, request: RejectKaizenRequest) => apiClient.post<KaizenDetailDto>(`/api/kaizens/${id}/reject`, request),

  setFeasibility: (id: number, request: FeasibilityRequest) => apiClient.post<KaizenDetailDto>(`/api/kaizens/${id}/feasibility`, request),

  close: (id: number, request: CloseKaizenRequest) => apiClient.post<KaizenDetailDto>(`/api/kaizens/${id}/close`, request),

  getSavings: (id: number) => apiClient.get<KaizenSavingDto[]>(`/api/kaizens/${id}/savings`),
  addSaving: (id: number, request: UpsertKaizenSavingRequest) => apiClient.post<KaizenSavingDto>(`/api/kaizens/${id}/savings`, request),

  getCosts: (id: number) => apiClient.get<KaizenCostDto[]>(`/api/kaizens/${id}/costs`),
  addCost: (id: number, request: UpsertKaizenCostRequest) => apiClient.post<KaizenCostDto>(`/api/kaizens/${id}/costs`, request),
}
