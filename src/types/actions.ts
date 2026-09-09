export type SourceModule = "Kaizen" | "FiveS"

export interface ActionValidatorDto {
  userId: number
  userName: string
  isApproved: boolean
}

export interface ActionDto {
  actionId: number
  sourceModule: string
  sourceRecordId: number
  description: string
  status: string
  priority: string
  dueDate: string | null
  responsibleUserId: number | null
  responsibleUserName: string | null
  isApprovedBySupervisor: boolean
  descriptionRatingStars: number | null
  executionRatingStars: number | null
  executionDescription: string | null
  validators: ActionValidatorDto[]
}

export interface CreateActionRequest {
  description: string
  priority: string
  dueDate?: string | null
}

export interface AssignActionRequest {
  responsibleUserId: number
}

export interface AddActionValidatorsRequest {
  userIds: number[]
}

export interface ApproveActionRequest {
  approve: boolean
  rejectComment?: string | null
}

export interface RateActionDescriptionRequest {
  ratingStars: number
}

export interface CompleteActionRequest {
  executionDescription: string
}

export interface RateActionExecutionRequest {
  ratingStars: number
}
