import { useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { kaizenApi } from "@/api/kaizen"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import type { CreateKaizenRequest } from "@/types/kaizen"

const EMPTY_FORM: CreateKaizenRequest = {
  title: "",
  problemDescription: "",
  lineId: null,
  machineId: null,
  gembaRealPlace: "",
  gembutsuMachineCondition: "",
  genjitsuParameterAdequacy: "",
  genriGensokuPrinciplesStandards: "",
  what: "",
  when: "",
  where: "",
  who: "",
  which: "",
  how: "",
  overallDescription: "",
}

/** Shared Create + Edit form — the request shape is identical (UpdateKaizenRequest extends CreateKaizenRequest). */
export function KaizenFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = id !== undefined
  const kaizenId = isEditMode ? Number(id) : null

  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState<CreateKaizenRequest>(EMPTY_FORM)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: existingKaizen, isLoading: isLoadingExisting, error: loadError } = useAsyncData(
    () => (kaizenId ? kaizenApi.getById(kaizenId) : Promise.resolve(null)),
    [kaizenId],
  )
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])
  const { data: machines } = useAsyncData(() => masterDataApi.getMachines(form.lineId ?? undefined), [form.lineId])

  if (existingKaizen && !hasHydrated) {
    setForm({
      title: existingKaizen.title,
      problemDescription: existingKaizen.problemDescription,
      lineId: null,
      machineId: existingKaizen.machineId,
      gembaRealPlace: existingKaizen.gembaRealPlace ?? "",
      gembutsuMachineCondition: existingKaizen.gembutsuMachineCondition ?? "",
      genjitsuParameterAdequacy: existingKaizen.genjitsuParameterAdequacy ?? "",
      genriGensokuPrinciplesStandards: existingKaizen.genriGensokuPrinciplesStandards ?? "",
      what: existingKaizen.what ?? "",
      when: existingKaizen.when ?? "",
      where: existingKaizen.where ?? "",
      who: existingKaizen.who ?? "",
      which: existingKaizen.which ?? "",
      how: existingKaizen.how ?? "",
      overallDescription: existingKaizen.overallDescription ?? "",
    })
    setHasHydrated(true)
  }

  function updateField<K extends keyof CreateKaizenRequest>(field: K, value: CreateKaizenRequest[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const savedKaizen = isEditMode && kaizenId ? await kaizenApi.update(kaizenId, form) : await kaizenApi.create(form)
      toast({ title: isEditMode ? "Kaizen updated" : "Kaizen created" })
      navigate(`/kaizen/${savedKaizen.kaizenId}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this Kaizen."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditMode && isLoadingExisting) {
    return <LoadingState label="Loading Kaizen…" />
  }
  if (isEditMode && loadError) {
    return <ErrorState message={loadError} />
  }

  return (
    <div>
      <PageHeader title={isEditMode ? "Edit Kaizen" : "New Kaizen Suggestion"} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Suggestion</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="problemDescription">Problem description</Label>
              <Textarea
                id="problemDescription"
                required
                rows={3}
                value={form.problemDescription}
                onChange={(event) => updateField("problemDescription", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lineId">Line</Label>
              <Select
                id="lineId"
                value={form.lineId ?? ""}
                onChange={(event) => updateField("lineId", event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Select a line</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="machineId">Machine</Label>
              <Select
                id="machineId"
                value={form.machineId ?? ""}
                onChange={(event) => updateField("machineId", event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Select a machine</option>
                {machines?.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4G Analysis (Gemba · Gembutsu · Genjitsu · Genri-Gensoku)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gembaRealPlace">Gemba — the real place</Label>
              <Textarea id="gembaRealPlace" value={form.gembaRealPlace ?? ""} onChange={(event) => updateField("gembaRealPlace", event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gembutsuMachineCondition">Gembutsu — machine condition</Label>
              <Textarea
                id="gembutsuMachineCondition"
                value={form.gembutsuMachineCondition ?? ""}
                onChange={(event) => updateField("gembutsuMachineCondition", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="genjitsuParameterAdequacy">Genjitsu — parameter adequacy</Label>
              <Textarea
                id="genjitsuParameterAdequacy"
                value={form.genjitsuParameterAdequacy ?? ""}
                onChange={(event) => updateField("genjitsuParameterAdequacy", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="genriGensokuPrinciplesStandards">Genri-Gensoku — principles/standards</Label>
              <Textarea
                id="genriGensokuPrinciplesStandards"
                value={form.genriGensokuPrinciplesStandards ?? ""}
                onChange={(event) => updateField("genriGensokuPrinciplesStandards", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5W1H</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["what", "when", "where", "who", "which", "how"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <Label htmlFor={field} className="capitalize">
                  {field}
                </Label>
                <Input id={field} value={form[field] ?? ""} onChange={(event) => updateField(field, event.target.value)} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 sm:col-span-3">
              <Label htmlFor="overallDescription">Overall description</Label>
              <Textarea
                id="overallDescription"
                rows={3}
                value={form.overallDescription ?? ""}
                onChange={(event) => updateField("overallDescription", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
