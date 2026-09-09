import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { incidentsApi } from "@/api/safety"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import { INCIDENT_TYPES, SEVERITY_LEVELS } from "@/types/safety"
import type { CreateIncidentRequest } from "@/types/safety"

const EMPTY_FORM: CreateIncidentRequest = {
  incidentType: INCIDENT_TYPES[0],
  severity: SEVERITY_LEVELS[0],
  areaId: null,
  departmentId: null,
  factoryArea: "",
  productionArea: "",
  what: "",
  why: "",
  where: "",
  when: "",
  whom: "",
  how: "",
}

export function IncidentFormPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState<CreateIncidentRequest>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])
  const { data: departments } = useAsyncData(() => masterDataApi.getDepartments(), [])

  function updateField<K extends keyof CreateIncidentRequest>(field: K, value: CreateIncidentRequest[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const created = await incidentsApi.create(form)
      toast({ title: "Incident reported" })
      navigate(`/incidents/${created.incidentId}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not report this incident."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Report Safety Incident" />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="incidentType">Incident type</Label>
              <Select id="incidentType" value={form.incidentType} onChange={(event) => updateField("incidentType", event.target.value)}>
                {INCIDENT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="factoryArea">Factory area</Label>
              <Input id="factoryArea" value={form.factoryArea ?? ""} onChange={(event) => updateField("factoryArea", event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productionArea">Production area</Label>
              <Input
                id="productionArea"
                value={form.productionArea ?? ""}
                onChange={(event) => updateField("productionArea", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5W1H</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="what">What happened</Label>
              <Textarea id="what" rows={3} value={form.what ?? ""} onChange={(event) => updateField("what", event.target.value)} />
            </div>
            {(["why", "where", "when", "whom", "how"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <Label htmlFor={field} className="capitalize">
                  {field}
                </Label>
                <Input id={field} value={form[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting || !form.what} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Report incident
          </Button>
        </div>
      </div>
    </div>
  )
}
