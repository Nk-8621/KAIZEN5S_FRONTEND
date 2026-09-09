import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { observationsApi } from "@/api/safety"
import { ApiError } from "@/api/client"
import type { ObservationDetailDto } from "@/types/safety"

interface ObservationWorkflowActionsProps {
  observation: ObservationDetailDto
  onChanged: () => void
}

type DialogKind = "assign" | "close" | null

export function ObservationWorkflowActions({ observation, onChanged }: ObservationWorkflowActionsProps) {
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const canReview = hasRole("Supervisor", "Admin")

  const [openDialog, setOpenDialog] = useState<DialogKind>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responsibleUserId, setResponsibleUserId] = useState("")
  const [closeComment, setCloseComment] = useState("")

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setIsSubmitting(true)
    try {
      await action()
      toast({ title: successMessage })
      setOpenDialog(null)
      onChanged()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "That action could not be completed."
      toast({ title: "Action failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canReview) {
    return null
  }

  const isOpenOrInReview = observation.status === "Open" || observation.status === "InReview"

  if (!isOpenOrInReview) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!observation.responsibleName && (
          <Button variant="outline" onClick={() => setOpenDialog("assign")}>
            Assign responsible person
          </Button>
        )}
        <Button onClick={() => setOpenDialog("close")}>Close observation</Button>
      </CardContent>

      <Dialog open={openDialog === "assign"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign responsible person</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsible-user-id">Responsible user ID</Label>
            <Input id="responsible-user-id" type="number" value={responsibleUserId} onChange={(event) => setResponsibleUserId(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || !responsibleUserId}
              onClick={() =>
                runAction(
                  () => observationsApi.assign(observation.observationId, { responsibleUserId: Number(responsibleUserId) }),
                  "Responsible person assigned.",
                )
              }
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "close"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close observation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="closeComment">Comment</Label>
            <Textarea id="closeComment" value={closeComment} onChange={(event) => setCloseComment(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() =>
                runAction(() => observationsApi.close(observation.observationId, { approve: false, comment: closeComment }), "Observation rejected.")
              }
            >
              Reject
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() =>
                runAction(() => observationsApi.close(observation.observationId, { approve: true, comment: closeComment }), "Observation closed.")
              }
            >
              Approve &amp; close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
