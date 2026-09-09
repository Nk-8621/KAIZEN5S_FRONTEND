export interface KaizenListItemDto {
  kaizenId: number
  title: string
  status: string
  pillarName: string | null
  lineName: string | null
  createdByName: string
  createdDate: string
  totalHardSaving: number
  totalVirtualSaving: number
}

export interface KaizenDetailDto extends KaizenListItemDto {
  problemDescription: string
  machineId: number | null
  machineName: string | null

  gembaRealPlace: string | null
  gembutsuMachineCondition: string | null
  genjitsuParameterAdequacy: string | null
  genriGensokuPrinciplesStandards: string | null
  analysisQualityRatingStars: number | null

  what: string | null
  when: string | null
  where: string | null
  who: string | null
  which: string | null
  how: string | null
  overallDescription: string | null

  isBestPractice: boolean
  isPokaYoke: boolean

  rejectReason: string | null
  rejectComment: string | null

  isFeasible: boolean | null
  feasibilityComment: string | null

  isResultConfirmed: boolean | null

  savings: KaizenSavingDto[]
  costs: KaizenCostDto[]
  benefitCostRatio: number
}

export interface CreateKaizenRequest {
  title: string
  problemDescription: string
  lineId?: number | null
  machineId?: number | null
  gembaRealPlace?: string | null
  gembutsuMachineCondition?: string | null
  genjitsuParameterAdequacy?: string | null
  genriGensokuPrinciplesStandards?: string | null
  what?: string | null
  when?: string | null
  where?: string | null
  who?: string | null
  which?: string | null
  how?: string | null
  overallDescription?: string | null
}

export type UpdateKaizenRequest = CreateKaizenRequest

export interface RequestInfoRequest {
  comment: string
}

export interface ApproveKaizenRequest {
  analysisQualityRatingStars: number
  pillarId: number
  isBestPractice: boolean
  isPokaYoke: boolean
}

export interface RejectKaizenRequest {
  rejectReason: string
  rejectComment: string
}

export interface FeasibilityRequest {
  isFeasible: boolean
  comment?: string | null
}

export interface CloseKaizenRequest {
  isResultConfirmed: boolean
}

export interface KaizenSavingDto {
  kaizenSavingId: number
  savingCategoryId: number
  savingCategoryName: string
  quantity: number
  hardValue: number
  virtualValue: number
}

export interface UpsertKaizenSavingRequest {
  savingCategoryId: number
  quantity: number
  hardValue: number
  virtualValue: number
}

export interface KaizenCostDto {
  kaizenCostId: number
  costCategoryId: number
  costCategoryName: string
  quantity: number
  value: number
}

export interface UpsertKaizenCostRequest {
  costCategoryId: number
  quantity: number
  value: number
}

export interface KaizenListFilter {
  status?: string | null
  pillarId?: number | null
  lineId?: number | null
  createdBy?: number | null
  dateFrom?: string | null
  dateTo?: string | null
}

export interface KaizenDashboardDto {
  statusFunnel: Record<string, number>
  kaizensPerPillar: Record<string, number>
  kaizensPerLine: Record<string, number>
  pendingHardSaving: number
  pendingVirtualSaving: number
  pendingCosts: number
  implementedHardSaving: number
  implementedVirtualSaving: number
  implementedCosts: number
}

/** The 9-state Kaizen status funnel, in order (BuildApp.Data.KaizenStatus enum, ANALYSIS.md §5.2). */
export const KAIZEN_STATUSES = [
  "SuggestionCreated",
  "SuggestionInfoRequested",
  "SuggestionRejected",
  "SuggestionApproved",
  "KaizenNotFeasible",
  "KaizenApproved",
  "KaizenUnderImplementation",
  "KaizenCheck",
  "KaizenCompleted",
] as const
