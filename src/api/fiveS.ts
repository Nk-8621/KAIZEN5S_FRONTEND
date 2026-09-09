import { apiClient, pagingToQuery } from "@/api/client"
import type { PagedRequest, PagedResult } from "@/types/common"
import type {
  AuditAnswerDto,
  AuditInstanceDetailDto,
  AuditInstanceListItemDto,
  CreateQuestionnaireRequest,
  CreateQuestionRequest,
  FiveSDashboardDto,
  QuestionDto,
  QuestionnaireDetailDto,
  QuestionnaireListItemDto,
  StartAuditInstanceRequest,
  SubmitAnswerRequest,
  UpdateQuestionnaireRequest,
} from "@/types/fiveS"

export const fiveSApi = {
  getQuestionnaires: (paging: PagedRequest, lineId?: number | null, areaId?: number | null) =>
    apiClient.get<PagedResult<QuestionnaireListItemDto>>("/api/questionnaires", { ...pagingToQuery(paging), lineId, areaId }),

  getQuestionnaireById: (id: number) => apiClient.get<QuestionnaireDetailDto>(`/api/questionnaires/${id}`),

  createQuestionnaire: (request: CreateQuestionnaireRequest) => apiClient.post<QuestionnaireDetailDto>("/api/questionnaires", request),

  updateQuestionnaire: (id: number, request: UpdateQuestionnaireRequest) =>
    apiClient.put<QuestionnaireDetailDto>(`/api/questionnaires/${id}`, request),

  addQuestion: (questionnaireId: number, request: CreateQuestionRequest) =>
    apiClient.post<QuestionDto>(`/api/questionnaires/${questionnaireId}/questions`, request),

  updateQuestion: (questionId: number, request: CreateQuestionRequest) =>
    apiClient.put<QuestionDto>(`/api/questionnaires/questions/${questionId}`, request),

  deleteQuestion: (questionId: number) => apiClient.delete<null>(`/api/questionnaires/questions/${questionId}`),

  startAuditInstance: (questionnaireId: number, request: StartAuditInstanceRequest) =>
    apiClient.post<AuditInstanceDetailDto>(`/api/questionnaires/${questionnaireId}/audit-instances`, request),

  getAuditInstances: (
    paging: PagedRequest,
    questionnaireId?: number | null,
    lineId?: number | null,
    areaId?: number | null,
    userId?: number | null,
    dateFrom?: string | null,
    dateTo?: string | null,
  ) =>
    apiClient.get<PagedResult<AuditInstanceListItemDto>>("/api/audit-instances", {
      ...pagingToQuery(paging),
      questionnaireId,
      lineId,
      areaId,
      userId,
      dateFrom,
      dateTo,
    }),

  getAuditInstanceById: (id: number) => apiClient.get<AuditInstanceDetailDto>(`/api/audit-instances/${id}`),

  submitAnswer: (auditInstanceId: number, request: SubmitAnswerRequest) =>
    apiClient.post<AuditAnswerDto>(`/api/audit-instances/${auditInstanceId}/answers`, request),

  submitInstance: (auditInstanceId: number) => apiClient.post<AuditInstanceDetailDto>(`/api/audit-instances/${auditInstanceId}/submit`),

  markReviewed: (auditInstanceId: number) => apiClient.post<AuditInstanceDetailDto>(`/api/audit-instances/${auditInstanceId}/review`),

  getDashboard: (lineId?: number | null, dateFrom?: string | null, dateTo?: string | null) =>
    apiClient.get<FiveSDashboardDto>("/api/five-s/dashboard", { lineId, dateFrom, dateTo }),
}
