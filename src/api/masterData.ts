import { apiClient } from "@/api/client"
import type {
  AreaDto,
  AssignmentMatrixEntryDto,
  CostCategoryDto,
  CreateAssignmentMatrixEntryRequest,
  DepartmentDto,
  LineDto,
  LookupDto,
  MachineDto,
  SavingCategoryDto,
  UpsertCostCategoryRequest,
  UpsertLookupRequest,
  UpsertSavingCategoryRequest,
} from "@/types/masterData"

export const masterDataApi = {
  // ---- Sites ----
  getSites: () => apiClient.get<LookupDto[]>("/api/sites"),
  createSite: (request: UpsertLookupRequest) => apiClient.post<LookupDto>("/api/sites", request),
  updateSite: (id: number, request: UpsertLookupRequest) => apiClient.put<LookupDto>(`/api/sites/${id}`, request),
  deleteSite: (id: number) => apiClient.delete<null>(`/api/sites/${id}`),

  // ---- Lines ----
  getLines: (siteId?: number | null) => apiClient.get<LineDto[]>("/api/lines", { siteId }),
  createLine: (siteId: number, request: UpsertLookupRequest) => apiClient.post<LineDto>("/api/lines", request, { siteId }),
  updateLine: (id: number, request: UpsertLookupRequest) => apiClient.put<LineDto>(`/api/lines/${id}`, request),
  deleteLine: (id: number) => apiClient.delete<null>(`/api/lines/${id}`),

  // ---- Areas ----
  getAreas: (siteId?: number | null) => apiClient.get<AreaDto[]>("/api/areas", { siteId }),
  createArea: (siteId: number, lineId: number | null, request: UpsertLookupRequest) =>
    apiClient.post<AreaDto>("/api/areas", request, { siteId, lineId }),
  updateArea: (id: number, request: UpsertLookupRequest) => apiClient.put<AreaDto>(`/api/areas/${id}`, request),
  deleteArea: (id: number) => apiClient.delete<null>(`/api/areas/${id}`),

  // ---- Machines ----
  getMachines: (lineId?: number | null) => apiClient.get<MachineDto[]>("/api/machines", { lineId }),
  createMachine: (lineId: number, request: UpsertLookupRequest) => apiClient.post<MachineDto>("/api/machines", request, { lineId }),
  updateMachine: (id: number, request: UpsertLookupRequest) => apiClient.put<MachineDto>(`/api/machines/${id}`, request),
  deleteMachine: (id: number) => apiClient.delete<null>(`/api/machines/${id}`),

  // ---- Pillars ----
  getPillars: () => apiClient.get<LookupDto[]>("/api/pillars"),
  createPillar: (request: UpsertLookupRequest) => apiClient.post<LookupDto>("/api/pillars", request),
  updatePillar: (id: number, request: UpsertLookupRequest) => apiClient.put<LookupDto>(`/api/pillars/${id}`, request),
  deletePillar: (id: number) => apiClient.delete<null>(`/api/pillars/${id}`),

  // ---- Departments ----
  getDepartments: (siteId?: number | null) => apiClient.get<DepartmentDto[]>("/api/departments", { siteId }),
  createDepartment: (siteId: number, request: UpsertLookupRequest) =>
    apiClient.post<DepartmentDto>("/api/departments", request, { siteId }),
  updateDepartment: (id: number, request: UpsertLookupRequest) => apiClient.put<DepartmentDto>(`/api/departments/${id}`, request),
  deleteDepartment: (id: number) => apiClient.delete<null>(`/api/departments/${id}`),

  // ---- Cost categories ----
  getCostCategories: () => apiClient.get<CostCategoryDto[]>("/api/cost-categories"),
  createCostCategory: (request: UpsertCostCategoryRequest) => apiClient.post<CostCategoryDto>("/api/cost-categories", request),
  updateCostCategory: (id: number, request: UpsertCostCategoryRequest) =>
    apiClient.put<CostCategoryDto>(`/api/cost-categories/${id}`, request),
  deleteCostCategory: (id: number) => apiClient.delete<null>(`/api/cost-categories/${id}`),

  // ---- Saving categories ----
  getSavingCategories: () => apiClient.get<SavingCategoryDto[]>("/api/saving-categories"),
  createSavingCategory: (request: UpsertSavingCategoryRequest) => apiClient.post<SavingCategoryDto>("/api/saving-categories", request),
  updateSavingCategory: (id: number, request: UpsertSavingCategoryRequest) =>
    apiClient.put<SavingCategoryDto>(`/api/saving-categories/${id}`, request),
  deleteSavingCategory: (id: number) => apiClient.delete<null>(`/api/saving-categories/${id}`),

  // ---- Assignment matrix ----
  getAssignmentMatrix: (lineId?: number | null) => apiClient.get<AssignmentMatrixEntryDto[]>("/api/assignment-matrix", { lineId }),
  addAssignmentMatrixEntry: (request: CreateAssignmentMatrixEntryRequest) =>
    apiClient.post<AssignmentMatrixEntryDto>("/api/assignment-matrix", request),
  removeAssignmentMatrixEntry: (id: number) => apiClient.delete<null>(`/api/assignment-matrix/${id}`),
}
