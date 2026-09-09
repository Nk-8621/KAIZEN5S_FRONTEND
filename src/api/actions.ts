import { apiClient, pagingToQuery } from "@/api/client"
import type {
  ActionDto,
  AddActionValidatorsRequest,
  ApproveActionRequest,
  AssignActionRequest,
  CompleteActionRequest,
  CreateActionRequest,
  RateActionDescriptionRequest,
  RateActionExecutionRequest,
  SourceModule,
} from "@/types/actions"
import type { PagedRequest, PagedResult } from "@/types/common"

/** Cross-module Action/Tag engine (ANALYSIS.md §7.5) shared by Kaizen and 5S. */
export const actionsApi = {
  getFiltered: (paging: PagedRequest, sourceModule?: SourceModule | null, status?: string | null, responsibleUserId?: number | null) =>
    apiClient.get<PagedResult<ActionDto>>("/api/actions", { ...pagingToQuery(paging), sourceModule, status, responsibleUserId }),

  getById: (actionId: number) => apiClient.get<ActionDto>(`/api/actions/${actionId}`),

  getForKaizen: (kaizenId: number) => apiClient.get<ActionDto[]>(`/api/kaizens/${kaizenId}/actions`),
  createForKaizen: (kaizenId: number, request: CreateActionRequest) =>
    apiClient.post<ActionDto>(`/api/kaizens/${kaizenId}/actions`, request),

  createForAuditAnswer: (answerId: number, request: CreateActionRequest) =>
    apiClient.post<ActionDto>(`/api/audit-answers/${answerId}/actions`, request),

  assign: (kaizenId: number, actionId: number, request: AssignActionRequest) =>
    apiClient.put<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/assign`, request),

  addValidators: (kaizenId: number, actionId: number, request: AddActionValidatorsRequest) =>
    apiClient.post<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/validators`, request),

  approveBySupervisor: (kaizenId: number, actionId: number, request: ApproveActionRequest) =>
    apiClient.put<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/approve`, request),

  approveByValidator: (kaizenId: number, actionId: number, validatorUserId: number, approve: boolean) =>
    apiClient.put<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/validators/${validatorUserId}/approve`, undefined, { approve }),

  rateDescription: (kaizenId: number, actionId: number, request: RateActionDescriptionRequest) =>
    apiClient.put<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/rate-description`, request),

  complete: (kaizenId: number, actionId: number, request: CompleteActionRequest) =>
    apiClient.post<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/complete`, request),

  rateExecution: (kaizenId: number, actionId: number, request: RateActionExecutionRequest) =>
    apiClient.put<ActionDto>(`/api/kaizens/${kaizenId}/actions/${actionId}/rate-execution`, request),
}
