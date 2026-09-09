import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Send } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { assessmentApi } from "@/api/assessment"
import { masterDataApi } from "@/api/masterData"
import { useAsyncData } from "@/hooks/useAsyncData"
import { ApiError } from "@/api/client"
import type { AssessmentQuestionDto } from "@/types/assessment"

/** The fixed-form runtime for whichever AssessmentForm was built by the dynamic form builder —
 * one control per question, chosen by its AnswerType (ANALYSIS.md §1.5 / §4 row 23). */
export function AssessmentSubmitPage() {
  const { id } = useParams<{ id: string }>()
  const formId = Number(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: form, isLoading, error } = useAsyncData(() => assessmentApi.getFormById(formId), [formId])
  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])

  const [areaId, setAreaId] = useState<number | "">("")
  const [lineId, setLineId] = useState<number | "">("")
  const [location, setLocation] = useState("")
  const [subLocation, setSubLocation] = useState("")
  const [answerValues, setAnswerValues] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return <LoadingState label="Loading assessment form…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!form) {
    return null
  }

  function updateAnswer(questionId: number, value: string) {
    setAnswerValues((previous) => ({ ...previous, [questionId]: value }))
  }

  const isValid = form.questions.filter((question) => question.isRequired).every((question) => (answerValues[question.assessmentQuestionId] ?? "") !== "")

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
      await assessmentApi.submit(formId, {
        areaId: areaId || null,
        lineId: lineId || null,
        location: location || null,
        subLocation: subLocation || null,
        answers: form!.questions.map((question) => ({
          assessmentQuestionId: question.assessmentQuestionId,
          answerValue: answerValues[question.assessmentQuestionId] ?? "",
        })),
      })
      toast({ title: "Assessment submitted" })
      navigate("/assessments/submissions")
    } catch (submitError) {
      const message = submitError instanceof ApiError ? submitError.message : "Could not submit this assessment."
      toast({ title: "Submit failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={form.title} description={form.description ?? undefined} />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="areaId">Area</Label>
              <Select id="areaId" value={areaId} onChange={(event) => setAreaId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Not specified</option>
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
                <option value="">Not specified</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subLocation">Sub-location</Label>
              <Input id="subLocation" value={subLocation} onChange={(event) => setSubLocation(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[...form.questions]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((question) => (
                <QuestionAnswerControl
                  key={question.assessmentQuestionId}
                  question={question}
                  value={answerValues[question.assessmentQuestionId] ?? ""}
                  onChange={(value) => updateAnswer(question.assessmentQuestionId, value)}
                />
              ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button disabled={isSubmitting || !isValid} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit assessment
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuestionAnswerControl({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestionDto
  value: string
  onChange: (value: string) => void
}) {
  const label = (
    <Label htmlFor={`answer-${question.assessmentQuestionId}`}>
      {question.questionText} {question.isRequired && <span className="text-destructive">*</span>}
    </Label>
  )

  if (question.answerType === "YesNo") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <div className="flex gap-2">
          {["OK", "Not OK", "NA"].map((option) => (
            <Button
              key={option}
              type="button"
              variant={value === option ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (question.answerType === "Rating") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              type="button"
              variant={value === String(rating) ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(String(rating))}
            >
              {rating}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (question.answerType === "Dropdown" || question.answerType === "SingleChoice") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <Select id={`answer-${question.assessmentQuestionId}`} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select an answer</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
    )
  }

  if (question.answerType === "MultipleChoice") {
    const selectedValues = value ? value.split("|") : []

    function toggleOption(option: string) {
      const isSelected = selectedValues.includes(option)
      const nextValues = isSelected ? selectedValues.filter((selected) => selected !== option) : [...selectedValues, option]
      onChange(nextValues.join("|"))
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <Button
              key={option}
              type="button"
              variant={selectedValues.includes(option) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleOption(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (question.answerType === "FileUpload") {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <Input
          id={`answer-${question.assessmentQuestionId}`}
          placeholder="File URL"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      <Textarea id={`answer-${question.assessmentQuestionId}`} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
