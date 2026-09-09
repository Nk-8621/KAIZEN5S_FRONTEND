export interface AssessmentFormListItemDto {
  assessmentFormId: number
  groupName: string
  title: string
  isActive: boolean
  questionCount: number
  submissionCount: number
}

export interface AssessmentFormDetailDto extends AssessmentFormListItemDto {
  description: string | null
  areaId: number | null
  lineId: number | null
  questions: AssessmentQuestionDto[]
}

export interface AssessmentQuestionDto {
  assessmentQuestionId: number
  questionText: string
  answerType: string
  options: string[] | null
  isRequired: boolean
  sortOrder: number
}

export interface CreateAssessmentFormRequest {
  groupName: string
  title: string
  description?: string | null
  areaId?: number | null
  lineId?: number | null
  isActive: boolean
  questions: CreateAssessmentQuestionRequest[]
}

export interface CreateAssessmentQuestionRequest {
  questionText: string
  answerType: string
  options?: string[] | null
  isRequired: boolean
  sortOrder: number
}

export interface SubmitAssessmentRequest {
  areaId?: number | null
  lineId?: number | null
  location?: string | null
  subLocation?: string | null
  answers: AssessmentAnswerRequest[]
}

export interface AssessmentAnswerRequest {
  assessmentQuestionId: number
  answerValue: string
  attachmentId?: number | null
}

export interface AssessmentSubmissionListItemDto {
  assessmentSubmissionId: number
  formTitle: string
  areaName: string | null
  submittedByName: string
  submittedDate: string
}

export interface AssessmentSubmissionDetailDto extends AssessmentSubmissionListItemDto {
  location: string | null
  subLocation: string | null
  answers: AssessmentAnswerDto[]
}

export interface AssessmentAnswerDto {
  assessmentQuestionId: number
  questionText: string
  answerValue: string
}

export interface AssessmentDashboardDto {
  categoryCompliance: Record<string, CategoryComplianceDto>
  topUsers: { userName: string; count: number }[]
  departmentBreakdown: Record<string, number>
}

export interface CategoryComplianceDto {
  okCount: number
  notOkCount: number
  compliancePercent: number
}

/** BuildApp.Data.AssessmentAnswerType enum. */
export const ASSESSMENT_ANSWER_TYPES = [
  "Text",
  "Dropdown",
  "SingleChoice",
  "MultipleChoice",
  "YesNo",
  "Rating",
  "FileUpload",
] as const
