import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Plus, Save } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { fiveSApi } from "@/api/fiveS"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import { QuestionRow } from "@/pages/fiveS/components/QuestionRow"
import { AddQuestionDialog } from "@/pages/fiveS/components/AddQuestionDialog"
import type { CreateQuestionnaireRequest } from "@/types/fiveS"

const EMPTY_FORM: CreateQuestionnaireRequest = {
  name: "",
  lineId: null,
  areaId: null,
  copiedFromQuestionnaireId: null,
  frequencyDays: null,
  isFrequencyActive: false,
}

/** Create + Edit questionnaire metadata; in edit mode also manages the question list inline,
 * since a questionnaire only becomes useful once it has questions (ANALYSIS.md §3.2). */
export function QuestionnaireFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = id !== undefined
  const questionnaireId = isEditMode ? Number(id) : null

  const navigate = useNavigate()
  const { toast } = useToast()

  const [form, setForm] = useState<CreateQuestionnaireRequest & { isActive: boolean }>({ ...EMPTY_FORM, isActive: true })
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

  const {
    data: existingQuestionnaire,
    isLoading: isLoadingExisting,
    error: loadError,
    reload: reloadQuestionnaire,
  } = useAsyncData(() => (questionnaireId ? fiveSApi.getQuestionnaireById(questionnaireId) : Promise.resolve(null)), [questionnaireId])
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])
  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])

  if (existingQuestionnaire && !hasHydrated) {
    setForm({
      name: existingQuestionnaire.name,
      lineId: null,
      areaId: null,
      copiedFromQuestionnaireId: existingQuestionnaire.copiedFromQuestionnaireId,
      frequencyDays: existingQuestionnaire.frequencyDays,
      isFrequencyActive: existingQuestionnaire.isFrequencyActive,
      isActive: existingQuestionnaire.isActive,
    })
    setHasHydrated(true)
  }

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      if (isEditMode && questionnaireId) {
        await fiveSApi.updateQuestionnaire(questionnaireId, form)
        toast({ title: "Questionnaire updated" })
        reloadQuestionnaire()
      } else {
        const created = await fiveSApi.createQuestionnaire(form)
        toast({ title: "Questionnaire created" })
        navigate(`/five-s/questionnaires/${created.questionnaireId}`)
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this questionnaire."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditMode && isLoadingExisting) {
    return <LoadingState label="Loading questionnaire…" />
  }
  if (isEditMode && loadError) {
    return <ErrorState message={loadError} />
  }

  const nextSortOrder = existingQuestionnaire ? existingQuestionnaire.questions.length : 0

  return (
    <div>
      <PageHeader title={isEditMode ? "Edit Questionnaire" : "New Questionnaire"} />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Questionnaire details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lineId">Line</Label>
              <Select
                id="lineId"
                value={form.lineId ?? ""}
                onChange={(event) => updateField("lineId", event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Not scoped to a line</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
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
                <option value="">Not scoped to an area</option>
                {areas?.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="frequencyDays">Frequency (days)</Label>
              <Input
                id="frequencyDays"
                type="number"
                value={form.frequencyDays ?? ""}
                onChange={(event) => updateField("frequencyDays", event.target.value ? Number(event.target.value) : null)}
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isFrequencyActive}
                  onCheckedChange={(checked) => updateField("isFrequencyActive", checked === true)}
                />
                Recurs on this frequency
              </label>
              {isEditMode && (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.isActive} onCheckedChange={(checked) => updateField("isActive", checked === true)} />
                  Active
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting || !form.name} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>

        {isEditMode && existingQuestionnaire && (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Questions ({existingQuestionnaire.questions.length})</CardTitle>
              <Button size="sm" onClick={() => setIsAddQuestionOpen(true)}>
                <Plus className="h-4 w-4" />
                Add question
              </Button>
            </CardHeader>
            <CardContent>
              {existingQuestionnaire.questions.length === 0 ? (
                <EmptyState title="No questions yet" description="Add the first question to this questionnaire." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Photo</TableHead>
                      <TableHead className="text-right">Sort</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...existingQuestionnaire.questions]
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((question) => (
                        <QuestionRow key={question.questionId} question={question} onChanged={reloadQuestionnaire} />
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>

            <AddQuestionDialog
              open={isAddQuestionOpen}
              onOpenChange={setIsAddQuestionOpen}
              nextSortOrder={nextSortOrder}
              onSave={(request) => fiveSApi.addQuestion(existingQuestionnaire.questionnaireId, request)}
              onSaved={reloadQuestionnaire}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
