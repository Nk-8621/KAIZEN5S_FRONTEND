import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { assessmentApi } from "@/api/assessment"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import { ASSESSMENT_ANSWER_TYPES } from "@/types/assessment"
import type { CreateAssessmentFormRequest, CreateAssessmentQuestionRequest } from "@/types/assessment"

const OPTIONS_ANSWER_TYPES = ["Dropdown", "SingleChoice", "MultipleChoice"]

function emptyQuestion(sortOrder: number): CreateAssessmentQuestionRequest {
  const question: CreateAssessmentQuestionRequest = {
    questionText: "",
    answerType: ASSESSMENT_ANSWER_TYPES[0],
    options: null,
    isRequired: true,
    sortOrder,
  }
  return question
}

/** The dynamic Assessment form builder (ANALYSIS.md §1.5 / §4 row 26) — 7 answer types, each
 * question optionally carrying an Options list for the choice-based types. There is no separate
 * "add question" endpoint like 5S's questionnaire builder; the whole form (with all its
 * questions) is created in one POST, so questions are staged in local state until Save. */
export function AssessmentFormBuilderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [groupName, setGroupName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [areaId, setAreaId] = useState<number | "">("")
  const [lineId, setLineId] = useState<number | "">("")
  const [isActive, setIsActive] = useState(true)
  const [questions, setQuestions] = useState<CreateAssessmentQuestionRequest[]>([emptyQuestion(0)])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])

  function updateQuestion(index: number, updates: Partial<CreateAssessmentQuestionRequest>) {
    setQuestions((previous) => previous.map((question, questionIndex) => (questionIndex === index ? { ...question, ...updates } : question)))
  }

  function addQuestion() {
    setQuestions((previous) => [...previous, emptyQuestion(previous.length)])
  }

  function removeQuestion(index: number) {
    setQuestions((previous) => previous.filter((_, questionIndex) => questionIndex !== index))
  }

  const isValid =
    groupName.trim() !== "" &&
    title.trim() !== "" &&
    questions.length > 0 &&
    questions.every((question) => question.questionText.trim() !== "")

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      const request: CreateAssessmentFormRequest = {
        groupName,
        title,
        description: description || null,
        areaId: areaId || null,
        lineId: lineId || null,
        isActive,
        questions,
      }
      const created = await assessmentApi.createForm(request)
      toast({ title: "Assessment form created" })
      navigate(`/assessments/forms/${created.assessmentFormId}/submit`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this assessment form."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Assessment Form" />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Form details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="groupName">Group</Label>
              <Input id="groupName" value={groupName} onChange={(event) => setGroupName(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="areaId">Area</Label>
              <Select id="areaId" value={areaId} onChange={(event) => setAreaId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Not scoped to an area</option>
                {areas?.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lineId">Line</Label>
              <Select id="lineId" value={lineId} onChange={(event) => setLineId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Not scoped to a line</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
              Active
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Button size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4" />
              Add question
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {questions.length === 0 && <EmptyState title="No questions yet" description="Add at least one question." />}

            {questions.map((question, index) => {
              const needsOptions = OPTIONS_ANSWER_TYPES.includes(question.answerType)
              const optionsText = question.options?.join(", ") ?? ""

              return (
                <div key={index} className="rounded-md border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Question {index + 1}</span>
                    <Button variant="outline" size="sm" onClick={() => removeQuestion(index)} disabled={questions.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor={`question-text-${index}`}>Question text</Label>
                      <Input
                        id={`question-text-${index}`}
                        value={question.questionText}
                        onChange={(event) => updateQuestion(index, { questionText: event.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`answer-type-${index}`}>Answer type</Label>
                      <Select
                        id={`answer-type-${index}`}
                        value={question.answerType}
                        onChange={(event) => updateQuestion(index, { answerType: event.target.value, options: null })}
                      >
                        {ASSESSMENT_ANSWER_TYPES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`sort-order-${index}`}>Sort order</Label>
                      <Input
                        id={`sort-order-${index}`}
                        type="number"
                        value={question.sortOrder}
                        onChange={(event) => updateQuestion(index, { sortOrder: Number(event.target.value) })}
                      />
                    </div>
                    {needsOptions && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor={`options-${index}`}>Options (comma-separated)</Label>
                        <Input
                          id={`options-${index}`}
                          value={optionsText}
                          onChange={(event) =>
                            updateQuestion(index, {
                              options: event.target.value
                                .split(",")
                                .map((option) => option.trim())
                                .filter((option) => option !== ""),
                            })
                          }
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={question.isRequired}
                        onCheckedChange={(checked) => updateQuestion(index, { isRequired: checked === true })}
                      />
                      Required
                    </label>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting || !isValid} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save form
          </Button>
        </div>
      </div>
    </div>
  )
}
