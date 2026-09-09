import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { incidentsApi } from "@/api/safety"
import { ApiError } from "@/api/client"
import type { IncidentDetailDto } from "@/types/safety"

interface IncidentWorkflowActionsProps {
  incident: IncidentDetailDto
  onChanged: () => void
}

type DialogKind = "assign" | "analyze" | "close" | "reopen" | null

/** Reviewer controls for one Incident — mirrors ANALYSIS.md §3.3's inferred
 * report → assign → analyze → close/reopen shape, gated by both status and role as convenience
 * only (the backend enforces the real rule). */
export function IncidentWorkflowActions({ incident, onChanged }: IncidentWorkflowActionsProps) {
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const canReview = hasRole("Supervisor", "Admin")

  const [openDialog, setOpenDialog] = useState<DialogKind>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [responsibleUserId, setResponsibleUserId] = useState("")
  const [why, setWhy] = useState(incident.why ?? "")
  const [where, setWhere] = useState(incident.where ?? "")
  const [when, setWhen] = useState(incident.when ?? "")
  const [whom, setWhom] = useState(incident.whom ?? "")
  const [how, setHow] = useState(incident.how ?? "")
  const [approverComments, setApproverComments] = useState(incident.approverComments ?? "")
  const [analysisRatingStars, setAnalysisRatingStars] = useState(incident.analysisRatingStars ?? 3)
  const [targetDate, setTargetDate] = useState(incident.targetDate ?? "")
  const [closeComment, setCloseComment] = useState("")
  const [reopenReason, setReopenReason] = useState("")

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

  const isOpenOrInReview = incident.status === "Open" || incident.status === "InReview"
  const isClosedOrRejected = incident.status === "Closed" || incident.status === "Rejected"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isOpenOrInReview && !incident.responsibleName && (
          <Button variant="outline" onClick={() => setOpenDialog("assign")}>
            Assign responsible person
          </Button>
        )}
        {isOpenOrInReview && <Button variant="outline" onClick={() => setOpenDialog("analyze")}>Fill analysis</Button>}
        {isOpenOrInReview && <Button onClick={() => setOpenDialog("close")}>Close incident</Button>}
        {isClosedOrRejected && <Button variant="outline" onClick={() => setOpenDialog("reopen")}>Reopen</Button>}
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
                runAction(() => incidentsApi.assign(incident.incidentId, { responsibleUserId: Number(responsibleUserId) }), "Responsible person assigned.")
              }
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "analyze"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fill analysis</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="why">Why</Label>
              <Input id="why" value={why} onChange={(event) => setWhy(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="where">Where</Label>
              <Input id="where" value={where} onChange={(event) => setWhere(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="when">When</Label>
              <Input id="when" value={when} onChange={(event) => setWhen(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whom">Whom</Label>
              <Input id="whom" value={whom} onChange={(event) => setWhom(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="how">How</Label>
              <Input id="how" value={how} onChange={(event) => setHow(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="approverComments">Approver comments</Label>
              <Textarea id="approverComments" value={approverComments} onChange={(event) => setApproverComments(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="analysisRatingStars">Analysis quality rating (1-5)</Label>
              <Select id="analysisRatingStars" value={analysisRatingStars} onChange={(event) => setAnalysisRatingStars(Number(event.target.value))}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="targetDate">Target date</Label>
              <Input id="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() =>
                runAction(
                  () =>
                    incidentsApi.analyze(incident.incidentId, {
                      why,
                      where,
                      when,
                      whom,
                      how,
                      approverComments,
                      analysisRatingStars,
                      targetDate: targetDate || null,
                    }),
                  "Analysis saved.",
                )
              }
            >
              Save analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "close"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close incident</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="closeComment">Comment</Label>
            <Textarea id="closeComment" value={closeComment} onChange={(event) => setCloseComment(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => runAction(() => incidentsApi.close(incident.incidentId, { approve: false, comment: closeComment }), "Incident rejected.")}
            >
              Reject
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => runAction(() => incidentsApi.close(incident.incidentId, { approve: true, comment: closeComment }), "Incident closed.")}
            >
              Approve &amp; close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "reopen"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen incident</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reopenReason">Reason</Label>
            <Textarea id="reopenReason" value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || !reopenReason}
              onClick={() => runAction(() => incidentsApi.reopen(incident.incidentId, { reason: reopenReason }), "Incident reopened.")}
            >
              Reopen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
