import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ApiError } from "@/api/client"
import { FIVE_S_CATEGORIES } from "@/types/fiveS"
import type { CreateQuestionRequest, QuestionDto } from "@/types/fiveS"

const EMPTY_FORM: CreateQuestionRequest = {
  category: FIVE_S_CATEGORIES[0],
  questionText: "",
  standardPhotoUrl: "",
  isPhotoRequired: false,
  sortOrder: 0,
}

interface AddQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (request: CreateQuestionRequest) => Promise<QuestionDto>
  onSaved: () => void
  existingQuestion?: QuestionDto | null
  nextSortOrder: number
}

/** Shared add/edit dialog for one QuestionnaireQuestion — a standard reference photo URL is
 * mandatory per ANALYSIS.md §1.2 ("a standard/reference photo is mandatory when creating a
 * question"). */
export function AddQuestionDialog({ open, onOpenChange, onSave, onSaved, existingQuestion, nextSortOrder }: AddQuestionDialogProps) {
  const { toast } = useToast()
  const isEditMode = existingQuestion !== null && existingQuestion !== undefined

  const [form, setForm] = useState<CreateQuestionRequest>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const initialForm = existingQuestion
        ? {
            category: existingQuestion.category,
            questionText: existingQuestion.questionText,
            standardPhotoUrl: existingQuestion.standardPhotoUrl,
            isPhotoRequired: existingQuestion.isPhotoRequired,
            sortOrder: existingQuestion.sortOrder,
          }
        : { ...EMPTY_FORM, sortOrder: nextSortOrder }
      setForm(initialForm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingQuestion])

  function updateField<K extends keyof CreateQuestionRequest>(field: K, value: CreateQuestionRequest[K]) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSave() {
    setIsSubmitting(true)
    try {
      await onSave(form)
      toast({ title: isEditMode ? "Question updated" : "Question added" })
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this question."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = form.questionText.trim() !== "" && form.standardPhotoUrl.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit question" : "Add question"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="question-category">Category</Label>
            <Select id="question-category" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              {FIVE_S_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="question-text">Question text</Label>
            <Textarea id="question-text" value={form.questionText} onChange={(event) => updateField("questionText", event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="question-photo-url">Standard (reference) photo URL</Label>
            <Input
              id="question-photo-url"
              value={form.standardPhotoUrl}
              onChange={(event) => updateField("standardPhotoUrl", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="question-sort-order">Sort order</Label>
            <Input
              id="question-sort-order"
              type="number"
              value={form.sortOrder}
              onChange={(event) => updateField("sortOrder", Number(event.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.isPhotoRequired}
              onCheckedChange={(checked) => updateField("isPhotoRequired", checked === true)}
            />
            Actual photo required from the Area Owner when answering
          </label>
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting || !isValid} onClick={handleSave}>
            {isEditMode ? "Save changes" : "Add question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
