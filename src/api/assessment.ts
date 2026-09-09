import { apiClient, pagingToQuery } from "@/api/client"
import type { PagedRequest, PagedResult } from "@/types/common"
import type {
  AssessmentDashboardDto,
  AssessmentFormDetailDto,
  AssessmentFormListItemDto,
  AssessmentSubmissionDetailDto,
  AssessmentSubmissionListItemDto,
  CreateAssessmentFormRequest,
  SubmitAssessmentRequest,
} from "@/types/assessment"

export const assessmentApi = {
  getForms: (paging: PagedRequest, groupName?: string | null, isActive?: boolean | null) =>
    apiClient.get<PagedResult<AssessmentFormListItemDto>>("/api/assessment-forms", { ...pagingToQuery(paging), groupName, isActive }),

  getFormById: (id: number) => apiClient.get<AssessmentFormDetailDto>(`/api/assessment-forms/${id}`),

  createForm: (request: CreateAssessmentFormRequest) => apiClient.post<AssessmentFormDetailDto>("/api/assessment-forms", request),

  submit: (formId: number, request: SubmitAssessmentRequest) =>
    apiClient.post<AssessmentSubmissionDetailDto>(`/api/assessment-forms/${formId}/submissions`, request),

  getSubmissions: (paging: PagedRequest, formId?: number | null, areaId?: number | null, dateFrom?: string | null, dateTo?: string | null) =>
    apiClient.get<PagedResult<AssessmentSubmissionListItemDto>>("/api/assessment-submissions", {
      ...pagingToQuery(paging),
      formId,
      areaId,
      dateFrom,
      dateTo,
    }),

  getSubmissionById: (id: number) => apiClient.get<AssessmentSubmissionDetailDto>(`/api/assessment-submissions/${id}`),

  getDashboard: (areaId?: number | null, lineId?: number | null) =>
    apiClient.get<AssessmentDashboardDto>("/api/assessments/dashboard", { areaId, lineId }),
}
