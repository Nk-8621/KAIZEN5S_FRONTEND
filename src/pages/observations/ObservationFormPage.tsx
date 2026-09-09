import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { observationsApi } from "@/api/safety"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import { SEVERITY_LEVELS } from "@/types/safety"
import type { CreateObservationRequest } from "@/types/safety"

/**
 * These classification option lists are not backend enums (there's no matching enum in
 * BuildApp.Data.Enums.cs — the Observation module is wireframe-only, ANALYSIS.md §1.4) — they're
 * the exact option sets observed in the live wireframe, kept here as the closest available
 * source of truth rather than left as unconstrained free text.
 */
const PPE_TYPES = ["Helmet", "Safety Shoes", "Gloves", "Ear Plugs", "Face Shield", "Nose Mask"]
const PROCEDURE_ISSUES = ["SOP Not Followed", "Unsafe Act", "Improper Handling", "Missing Permit"]
const ENVIRONMENT_ISSUES = ["Lighting", "Congestion", "Noise", "Slippery Floor"]
const PERSON_REACTIONS = ["Calm", "Cooperated", "Defensive", "Aggressive"]
const SHIFTS = ["Morning", "Afternoon", "Night"]

const EMPTY_FORM: CreateObservationRequest = {
  severity: SEVERITY_LEVELS[0],
  areaId: null,
  departmentId: null,
  ppeType: null,
  procedureIssue: null,
  environmentIssue: null,
  personReaction: null,
  shift: null,
}

export function ObservationFormPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState<CreateObservationRequest>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])
  const { data: departments } = useAsyncData(() => masterDataApi.getDepartments(), [])

  function updateField<K extends keyof CreateObservationRequest>(field: K, value: CreateObservationRequest[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const created = await observationsApi.create(form)
      toast({ title: "Observation logged" })
      navigate(`/observations/${created.observationId}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not log this observation."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Log Safety Observation" />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="severity">Severity</Label>
              <Select id="severity" value={form.severity} onChange={(event) => updateField("severity", event.target.value)}>
                {SEVERITY_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shift">Shift</Label>
              <Select id="shift" value={form.shift ?? ""} onChange={(event) => updateField("shift", event.target.value || null)}>
                <option value="">Not specified</option>
                {SHIFTS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="areaId">Area</Label>
              <Select
                id="areaId"
                value={form.areaId ?? ""}
                onChange={(event) => updateField("areaId", event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Select an area</option>
                {areas?.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                id="departmentId"
                value={form.departmentId ?? ""}
                onChange={(event) => updateField("departmentId", event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Select a department</option>
                {departments?.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observation classification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ppeType">PPE type observed</Label>
              <Select id="ppeType" value={form.ppeType ?? ""} onChange={(event) => updateField("ppeType", event.target.value || null)}>
                <option value="">Not applicable</option>
                {PPE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="procedureIssue">Procedure issue</Label>
              <Select
                id="procedureIssue"
                value={form.procedureIssue ?? ""}
                onChange={(event) => updateField("procedureIssue", event.target.value || null)}
              >
                <option value="">Not applicable</option>
                {PROCEDURE_ISSUES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="environmentIssue">Work-environment issue</Label>
              <Select
                id="environmentIssue"
                value={form.environmentIssue ?? ""}
                onChange={(event) => updateField("environmentIssue", event.target.value || null)}
              >
                <option value="">Not applicable</option>
                {ENVIRONMENT_ISSUES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="personReaction">Person's initial reaction</Label>
              <Select
                id="personReaction"
                value={form.personReaction ?? ""}
                onChange={(event) => updateField("personReaction", event.target.value || null)}
              >
                <option value="">Not applicable</option>
                {PERSON_REACTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Log observation
          </Button>
        </div>
      </div>
    </div>
  )
}
