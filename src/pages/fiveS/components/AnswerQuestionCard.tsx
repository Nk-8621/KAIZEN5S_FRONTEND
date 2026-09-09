import { useState } from "react"
import { Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { fiveSApi } from "@/api/fiveS"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import type { AuditAnswerDto } from "@/types/fiveS"

const RATING_VALUES = [1, 2, 3, 4, 5] as const

/** One question in the audit-answering runtime (ANALYSIS.md §3.2 / §4 row 14 — the field-use
 * screen the wireframe never implemented). Rating 0 means "not yet answered." A low rating
 * (<= 2, matching the review-flag gate in ANALYSIS.md §11 item 2) requires a comment before
 * saving, so the reviewer always has context for a flagged row. */
export function AnswerQuestionCard({ auditInstanceId, answer, onSaved }: { auditInstanceId: number; answer: AuditAnswerDto; onSaved: () => void }) {
  const { toast } = useToast()
  const [rating, setRating] = useState(answer.rating)
  const [comment, setComment] = useState(answer.comment ?? "")
  const [actualPhotoUrl, setActualPhotoUrl] = useState(answer.actualPhotoUrl ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAnswered = answer.rating > 0
  const requiresComment = rating > 0 && rating <= 2
  const isValid = rating > 0 && (!requiresComment || comment.trim() !== "")

  async function handleSaveAnswer() {
    setIsSubmitting(true)
    try {
      await fiveSApi.submitAnswer(auditInstanceId, {
        questionId: answer.questionId,
        rating,
        comment: comment || null,
        actualPhotoUrl: actualPhotoUrl || null,
      })
      toast({ title: "Answer saved" })
      onSaved()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not save this answer."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{answer.category}</Badge>
          {isAnswered && (
            <Badge variant="success">
              <Check className="h-3 w-3" />
              Answered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-medium">{answer.questionText}</p>

        {answer.standardPhotoUrl && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Standard reference photo</p>
            <img src={answer.standardPhotoUrl} alt="Standard reference" className="h-32 w-auto rounded-md border border-border object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Rating (1 = poor, 5 = excellent)</Label>
          <div className="flex gap-2">
            {RATING_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                  rating === value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-accent",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`comment-${answer.auditAnswerId}`}>
            Comment {requiresComment && <span className="text-destructive">(required for a low rating)</span>}
          </Label>
          <Textarea id={`comment-${answer.auditAnswerId}`} value={comment} onChange={(event) => setComment(event.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`photo-${answer.auditAnswerId}`}>Actual photo URL</Label>
          <Input
            id={`photo-${answer.auditAnswerId}`}
            value={actualPhotoUrl}
            onChange={(event) => setActualPhotoUrl(event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button disabled={isSubmitting || !isValid} onClick={handleSaveAnswer}>
            Save answer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
