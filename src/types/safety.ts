export interface IncidentListItemDto {
  incidentId: number
  incidentType: string
  severity: string
  status: string
  areaName: string | null
  reportedByName: string
  responsibleName: string | null
  createdDate: string
}

export interface IncidentDetailDto extends IncidentListItemDto {
  factoryArea: string | null
  productionArea: string | null
  what: string | null
  why: string | null
  where: string | null
  when: string | null
  whom: string | null
  how: string | null
  approverComments: string | null
  analysisRatingStars: number | null
  targetDate: string | null
}

export interface CreateIncidentRequest {
  incidentType: string
  severity: string
  areaId?: number | null
  departmentId?: number | null
  factoryArea?: string | null
  productionArea?: string | null
  what?: string | null
  why?: string | null
  where?: string | null
  when?: string | null
  whom?: string | null
  how?: string | null
}

export interface AssignIncidentRequest {
  responsibleUserId: number
}

export interface AnalyzeIncidentRequest {
  why?: string | null
  where?: string | null
  when?: string | null
  whom?: string | null
  how?: string | null
  approverComments?: string | null
  analysisRatingStars?: number | null
  targetDate?: string | null
}

export interface CloseIncidentRequest {
  approve: boolean
  comment?: string | null
}

export interface ReopenIncidentRequest {
  reason: string
}

export interface ObservationListItemDto {
  observationId: number
  severity: string
  status: string
  areaName: string | null
  reportedByName: string
  responsibleName: string | null
  createdDate: string
}

export interface ObservationDetailDto extends ObservationListItemDto {
  ppeType: string | null
  procedureIssue: string | null
  environmentIssue: string | null
  personReaction: string | null
  shift: string | null
  comments: string | null
}

export interface CreateObservationRequest {
  severity: string
  areaId?: number | null
  departmentId?: number | null
  ppeType?: string | null
  procedureIssue?: string | null
  environmentIssue?: string | null
  personReaction?: string | null
  shift?: string | null
}

export interface AssignObservationRequest {
  responsibleUserId: number
}

export interface CloseObservationRequest {
  approve: boolean
  comment?: string | null
}

export interface SafetyDashboardFilter {
  areaId?: number | null
  departmentId?: number | null
  dateFrom?: string | null
  dateTo?: string | null
}

export interface HeinrichPyramidDto {
  majorInjuryCount: number
  nearMissCount: number
  minorIncidentCount: number
}

export interface LeaderboardEntryDto {
  userName: string
  count: number
}

export interface IncidentDashboardDto {
  statusFunnel: Record<string, number>
  severityBreakdown: Record<string, number>
  departmentBreakdown: Record<string, number>
  areaBreakdown: Record<string, number>
  heinrichPyramid: HeinrichPyramidDto
  topReporters: LeaderboardEntryDto[]
}

export interface ObservationDashboardDto {
  ppeBreakdown: Record<string, number>
  procedureBreakdown: Record<string, number>
  environmentBreakdown: Record<string, number>
  compliancePercent: number
  shiftBreakdown: Record<string, number>
  departmentBreakdown: Record<string, number>
  topReporters: LeaderboardEntryDto[]
}

/** BuildApp.Data.IncidentType enum. */
export const INCIDENT_TYPES = ["UnsafeAct", "UnsafeCondition", "NearMiss", "Accident", "Injury"] as const

/** BuildApp.Data.SeverityLevel enum. */
export const SEVERITY_LEVELS = ["Low", "Medium", "High"] as const

/** BuildApp.Data.SafetyRecordStatus enum — shared by Incident and Observation. */
export const SAFETY_RECORD_STATUSES = ["Open", "InReview", "Closed", "Rejected", "Reopened"] as const
