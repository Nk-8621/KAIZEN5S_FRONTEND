import { useState } from "react"
import { useParams } from "react-router-dom"
import { CheckCircle2, Flag } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { StatusPill } from "@/components/shared/StatusPill"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useAsyncData } from "@/hooks/useAsyncData"
import { fiveSApi } from "@/api/fiveS"
import { actionsApi } from "@/api/actions"
import { ApiError } from "@/api/client"
import { formatDate } from "@/lib/utils"
import { AnswerQuestionCard } from "@/pages/fiveS/components/AnswerQuestionCard"
import { CreateActionDialog } from "@/pages/kaizen/components/CreateActionDialog"
import type { AuditAnswerDto } from "@/types/fiveS"

export function AuditInstanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const auditInstanceId = Number(id)
  const { hasRole } = useAuth()
  const { toast } = useToast()

  const { data: auditInstance, isLoading, error, reload } = useAsyncData(() => fiveSApi.getAuditInstanceById(auditInstanceId), [auditInstanceId])
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false)
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false)
  const [actionDialogFor, setActionDialogFor] = useState<AuditAnswerDto | null>(null)

  const canReview = hasRole("Supervisor", "Admin")

  async function handleSubmitAudit() {
    setIsSubmittingAudit(true)
    try {
      await fiveSApi.submitInstance(auditInstanceId)
      toast({ title: "Audit submitted" })
      reload()
    } catch (submitError) {
      const message = submitError instanceof ApiError ? submitError.message : "Could not submit this audit."
      toast({ title: "Submit failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmittingAudit(false)
    }
  }

  async function handleMarkReviewed() {
    setIsMarkingReviewed(true)
    try {
      await fiveSApi.markReviewed(auditInstanceId)
      toast({ title: "Audit marked reviewed" })
      reload()
    } catch (reviewError) {
      const message = reviewError instanceof ApiError ? reviewError.message : "Could not mark this audit reviewed."
      toast({ title: "Review failed", description: message, variant: "destructive" })
    } finally {
      setIsMarkingReviewed(false)
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading audit…" />
  }
  if (error) {
    return <ErrorState message={error} />
  }
  if (!auditInstance) {
    return null
  }

  const allAnswered = auditInstance.answers.every((answer) => answer.rating > 0)

  return (
    <div>
      <PageHeader
        title={auditInstance.questionnaireName}
        description={`${auditInstance.lineName ?? auditInstance.areaName ?? "Unscoped"} — answered by ${auditInstance.answeredByName}`}
        actions={
          <>
            <StatusPill status={auditInstance.status} />
            {auditInstance.status === "InProgress" && (
              <Button disabled={!allAnswered || isSubmittingAudit} onClick={handleSubmitAudit}>
                <CheckCircle2 className="h-4 w-4" />
                Submit audit
              </Button>
            )}
            {auditInstance.status === "Submitted" && canReview && (
              <Button disabled={isMarkingReviewed} onClick={handleMarkReviewed}>
                <CheckCircle2 className="h-4 w-4" />
                Mark reviewed
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted</p>
            <p className="mt-1 font-medium">{formatDate(auditInstance.submittedDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Average rating</p>
            <p className="mt-1 font-medium">{auditInstance.averageRating !== null ? auditInstance.averageRating.toFixed(1) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Flagged answers</p>
            <p className="mt-1 font-medium">{auditInstance.flaggedAnswerCount}</p>
          </CardContent>
        </Card>
      </div>

      {auditInstance.status === "InProgress" ? (
        <div className="flex flex-col gap-4">
          {auditInstance.answers.map((answer) => (
            <AnswerQuestionCard key={answer.auditAnswerId} auditInstanceId={auditInstanceId} answer={answer} onSaved={reload} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {auditInstance.answers.map((answer) => (
            <Card key={answer.auditAnswerId} className={answer.isFlaggedForReview ? "border-destructive/40" : undefined}>
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{answer.category}</Badge>
                  {answer.isFlaggedForReview && (
                    <Badge variant="destructive">
                      <Flag className="h-3 w-3" />
                      Flagged
                    </Badge>
                  )}
                  {answer.hasCorrectiveAction && <Badge variant="warning">Action raised</Badge>}
                </div>
                <span className="text-lg font-semibold tabular-nums">{answer.rating}/5</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="font-medium">{answer.questionText}</p>
                {answer.comment && <p className="text-muted-foreground">{answer.comment}</p>}
                <div className="flex gap-4">
                  {answer.standardPhotoUrl && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Standard</p>
                      <img src={answer.standardPhotoUrl} alt="Standard reference" className="h-24 w-auto rounded-md border border-border" />
                    </div>
                  )}
                  {answer.actualPhotoUrl && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Actual</p>
                      <img src={answer.actualPhotoUrl} alt="Actual condition" className="h-24 w-auto rounded-md border border-border" />
                    </div>
                  )}
                </div>
                {canReview && !answer.hasCorrectiveAction && (
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setActionDialogFor(answer)}>
                      <Flag className="h-4 w-4" />
                      Raise action
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {actionDialogFor && (
        <CreateActionDialog
          open={actionDialogFor !== null}
          onOpenChange={(open) => !open && setActionDialogFor(null)}
          onCreate={(request) => actionsApi.createForAuditAnswer(actionDialogFor.auditAnswerId, request)}
          onCreated={reload}
        />
      )}
    </div>
  )
}
