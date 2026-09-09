import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAsyncData } from "@/hooks/useAsyncData"
import { masterDataApi } from "@/api/masterData"
import { SimpleLookupCard } from "@/pages/settings/components/SimpleLookupCard"
import { ScopedLookupCard } from "@/pages/settings/components/ScopedLookupCard"
import { AreasCard } from "@/pages/settings/components/AreasCard"
import { CostCategoriesCard } from "@/pages/settings/components/CostCategoriesCard"
import { SavingCategoriesCard } from "@/pages/settings/components/SavingCategoriesCard"
import { AssignmentMatrixCard } from "@/pages/settings/components/AssignmentMatrixCard"

/** Admin master-data CRUD — reachable only from the sidebar shell, matching ANALYSIS.md §4 row
 * 16 ("generic CRUD, only reachable from the sidebar shell, not linked from either module"). */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("sites")

  const { data: sites, isLoading: isLoadingSites, error: sitesError, reload: reloadSites } = useAsyncData(() => masterDataApi.getSites(), [])
  const { data: pillars, isLoading: isLoadingPillars, error: pillarsError, reload: reloadPillars } = useAsyncData(() => masterDataApi.getPillars(), [])

  const [lineSiteId, setLineSiteId] = useState<number | "">("")
  const { data: lines, isLoading: isLoadingLines, error: linesError, reload: reloadLines } = useAsyncData(
    () => masterDataApi.getLines(lineSiteId || null),
    [lineSiteId],
  )

  const [departmentSiteId, setDepartmentSiteId] = useState<number | "">("")
  const {
    data: departments,
    isLoading: isLoadingDepartments,
    error: departmentsError,
    reload: reloadDepartments,
  } = useAsyncData(() => masterDataApi.getDepartments(departmentSiteId || null), [departmentSiteId])

  const [areaSiteId, setAreaSiteId] = useState<number | "">("")

  const [machineLineId, setMachineLineId] = useState<number | "">("")
  const { data: allLines } = useAsyncData(() => masterDataApi.getLines(), [])
  const {
    data: machines,
    isLoading: isLoadingMachines,
    error: machinesError,
    reload: reloadMachines,
  } = useAsyncData(() => masterDataApi.getMachines(machineLineId || null), [machineLineId])

  return (
    <div>
      <PageHeader title="Settings" description="Shared master data used across all 5 modules." />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="lines">Lines</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="pillars">Pillars</TabsTrigger>
          <TabsTrigger value="cost-categories">Cost categories</TabsTrigger>
          <TabsTrigger value="saving-categories">Saving categories</TabsTrigger>
          <TabsTrigger value="assignment-matrix">Assignment matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="sites">
          <SimpleLookupCard
            title="Sites"
            items={sites}
            isLoading={isLoadingSites}
            error={sitesError}
            onCreate={masterDataApi.createSite}
            onUpdate={masterDataApi.updateSite}
            onDelete={masterDataApi.deleteSite}
            onChanged={reloadSites}
          />
        </TabsContent>

        <TabsContent value="lines">
          <ScopedLookupCard
            title="Lines"
            parentLabel="Site"
            parentOptions={sites ?? undefined}
            parentId={lineSiteId}
            onParentChange={setLineSiteId}
            items={lines}
            isLoading={isLoadingLines}
            error={linesError}
            onCreate={(siteId, request) => masterDataApi.createLine(siteId, request)}
            onUpdate={masterDataApi.updateLine}
            onDelete={masterDataApi.deleteLine}
            onChanged={reloadLines}
          />
        </TabsContent>

        <TabsContent value="areas">
          <AreasCard siteId={areaSiteId} onSiteChange={setAreaSiteId} siteOptions={sites ?? undefined} />
        </TabsContent>

        <TabsContent value="machines">
          <ScopedLookupCard
            title="Machines"
            parentLabel="Line"
            parentOptions={allLines ?? undefined}
            parentId={machineLineId}
            onParentChange={setMachineLineId}
            items={machines}
            isLoading={isLoadingMachines}
            error={machinesError}
            onCreate={(lineId, request) => masterDataApi.createMachine(lineId, request)}
            onUpdate={masterDataApi.updateMachine}
            onDelete={masterDataApi.deleteMachine}
            onChanged={reloadMachines}
          />
        </TabsContent>

        <TabsContent value="departments">
          <ScopedLookupCard
            title="Departments"
            parentLabel="Site"
            parentOptions={sites ?? undefined}
            parentId={departmentSiteId}
            onParentChange={setDepartmentSiteId}
            items={departments}
            isLoading={isLoadingDepartments}
            error={departmentsError}
            onCreate={(siteId, request) => masterDataApi.createDepartment(siteId, request)}
            onUpdate={masterDataApi.updateDepartment}
            onDelete={masterDataApi.deleteDepartment}
            onChanged={reloadDepartments}
          />
        </TabsContent>

        <TabsContent value="pillars">
          <SimpleLookupCard
            title="Pillars"
            items={pillars}
            isLoading={isLoadingPillars}
            error={pillarsError}
            onCreate={masterDataApi.createPillar}
            onUpdate={masterDataApi.updatePillar}
            onDelete={masterDataApi.deletePillar}
            onChanged={reloadPillars}
          />
        </TabsContent>

        <TabsContent value="cost-categories">
          <CostCategoriesCard />
        </TabsContent>

        <TabsContent value="saving-categories">
          <SavingCategoriesCard />
        </TabsContent>

        <TabsContent value="assignment-matrix">
          <AssignmentMatrixCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
