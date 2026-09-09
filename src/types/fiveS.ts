export interface QuestionnaireListItemDto {
  questionnaireId: number
  name: string
  lineName: string | null
  areaName: string | null
  isActive: boolean
  isFrequencyActive: boolean
  frequencyDays: number | null
  questionCount: number
  createdDate: string
}

export interface QuestionnaireDetailDto extends QuestionnaireListItemDto {
  copiedFromQuestionnaireId: number | null
  questions: QuestionDto[]
}

export interface QuestionDto {
  questionId: number
  category: string
  questionText: string
  standardPhotoUrl: string
  isPhotoRequired: boolean
  answerType: string
  sortOrder: number
}

export interface CreateQuestionnaireRequest {
  name: string
  lineId?: number | null
  areaId?: number | null
  copiedFromQuestionnaireId?: number | null
  frequencyDays?: number | null
  isFrequencyActive: boolean
}

export interface UpdateQuestionnaireRequest extends CreateQuestionnaireRequest {
  isActive: boolean
}

export interface CreateQuestionRequest {
  category: string
  questionText: string
  standardPhotoUrl: string
  isPhotoRequired: boolean
  sortOrder: number
}

export interface AuditInstanceListItemDto {
  auditInstanceId: number
  questionnaireName: string
  answeredByName: string
  areaName: string | null
  lineName: string | null
  status: string
  submittedDate: string | null
  averageRating: number | null
  flaggedAnswerCount: number
}

export interface AuditInstanceDetailDto extends AuditInstanceListItemDto {
  answers: AuditAnswerDto[]
}

export interface AuditAnswerDto {
  auditAnswerId: number
  questionId: number
  questionText: string
  category: string
  standardPhotoUrl: string
  rating: number
  comment: string | null
  actualPhotoUrl: string | null
  isFlaggedForReview: boolean
  hasCorrectiveAction: boolean
}

export interface StartAuditInstanceRequest {
  areaId?: number | null
  lineId?: number | null
}

export interface SubmitAnswerRequest {
  questionId: number
  rating: number
  comment?: string | null
  actualPhotoUrl?: string | null
}

export interface FiveSDashboardDto {
  questionnaireCount: number
  usersAnsweredCount: number
  averageRating: number
  categoryCompletionPercent: Record<string, number>
  ratingDistributionByCategory: Record<string, Record<number, number>>
  questionsWithActions: number
  questionsWithoutActions: number
}

/** The 5 S's, in canonical order (BuildApp.Data.FiveSCategory enum). */
export const FIVE_S_CATEGORIES = ["Seiri", "Seiton", "Seiso", "Seiketsu", "Shitsuke"] as const

export const AUDIT_INSTANCE_STATUSES = ["InProgress", "Submitted", "Reviewed"] as const
