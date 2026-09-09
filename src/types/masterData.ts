export interface LookupDto {
  id: number
  name: string
  code: string | null
  isActive: boolean
}

export interface LineDto extends LookupDto {
  siteId: number
  lineType: string | null
}

export interface AreaDto extends LookupDto {
  siteId: number
  lineId: number | null
}

export interface MachineDto extends LookupDto {
  lineId: number
}

export interface DepartmentDto extends LookupDto {
  siteId: number
}

export interface CostCategoryDto extends LookupDto {
  unitOfMeasure: string | null
  effectiveYear: number | null
}

export interface SavingCategoryDto extends LookupDto {
  effectiveYear: number | null
}

export interface UpsertLookupRequest {
  name: string
  code?: string | null
  isActive: boolean
}

export interface UpsertCostCategoryRequest {
  name: string
  unitOfMeasure?: string | null
  effectiveYear?: number | null
  isActive: boolean
}

export interface UpsertSavingCategoryRequest {
  name: string
  effectiveYear?: number | null
  isActive: boolean
}

export interface AssignmentMatrixEntryDto {
  assignmentMatrixEntryId: number
  lineId: number
  lineName: string
  userId: number
  userName: string
  roleType: string
}

export interface CreateAssignmentMatrixEntryRequest {
  lineId: number
  userId: number
  roleType: string
}
