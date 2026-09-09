import { apiClient, pagingToQuery } from "@/api/client"
import type { PagedRequest, PagedResult } from "@/types/common"
import type {
  AnalyzeIncidentRequest,
  AssignIncidentRequest,
  AssignObservationRequest,
  CloseIncidentRequest,
  CloseObservationRequest,
  CreateIncidentRequest,
  CreateObservationRequest,
  IncidentDashboardDto,
  IncidentDetailDto,
  IncidentListItemDto,
  ObservationDashboardDto,
  ObservationDetailDto,
  ObservationListItemDto,
  ReopenIncidentRequest,
  SafetyDashboardFilter,
} from "@/types/safety"

export const incidentsApi = {
  getList: (
    paging: PagedRequest,
    status?: string | null,
    severity?: string | null,
    areaId?: number | null,
    dateFrom?: string | null,
    dateTo?: string | null,
  ) => apiClient.get<PagedResult<IncidentListItemDto>>("/api/incidents", { ...pagingToQuery(paging), status, severity, areaId, dateFrom, dateTo }),

  getDashboard: (filter: SafetyDashboardFilter) => apiClient.get<IncidentDashboardDto>("/api/incidents/dashboard", { ...filter }),

  getById: (id: number) => apiClient.get<IncidentDetailDto>(`/api/incidents/${id}`),

  create: (request: CreateIncidentRequest) => apiClient.post<IncidentDetailDto>("/api/incidents", request),

  assign: (id: number, request: AssignIncidentRequest) => apiClient.put<IncidentDetailDto>(`/api/incidents/${id}/assign`, request),

  analyze: (id: number, request: AnalyzeIncidentRequest) => apiClient.put<IncidentDetailDto>(`/api/incidents/${id}/analyze`, request),

  close: (id: number, request: CloseIncidentRequest) => apiClient.post<IncidentDetailDto>(`/api/incidents/${id}/close`, request),

  reopen: (id: number, request: ReopenIncidentRequest) => apiClient.post<IncidentDetailDto>(`/api/incidents/${id}/reopen`, request),
}

export const observationsApi = {
  getList: (
    paging: PagedRequest,
    status?: string | null,
    severity?: string | null,
    areaId?: number | null,
    dateFrom?: string | null,
    dateTo?: string | null,
  ) =>
    apiClient.get<PagedResult<ObservationListItemDto>>("/api/observations", {
      ...pagingToQuery(paging),
      status,
      severity,
      areaId,
      dateFrom,
      dateTo,
    }),

  getDashboard: (filter: SafetyDashboardFilter) => apiClient.get<ObservationDashboardDto>("/api/observations/dashboard", { ...filter }),

  getById: (id: number) => apiClient.get<ObservationDetailDto>(`/api/observations/${id}`),

  create: (request: CreateObservationRequest) => apiClient.post<ObservationDetailDto>("/api/observations", request),

  assign: (id: number, request: AssignObservationRequest) => apiClient.put<ObservationDetailDto>(`/api/observations/${id}/assign`, request),

  close: (id: number, request: CloseObservationRequest) => apiClient.post<ObservationDetailDto>(`/api/observations/${id}/close`, request),
}
