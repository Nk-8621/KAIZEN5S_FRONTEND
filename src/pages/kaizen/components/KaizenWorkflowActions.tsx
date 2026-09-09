import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useAsyncData } from "@/hooks/useAsyncData"
import { kaizenApi } from "@/api/kaizen"
import { masterDataApi } from "@/api/masterData"
import { ApiError } from "@/api/client"
import type { KaizenDetailDto } from "@/types/kaizen"

interface KaizenWorkflowActionsProps {
  kaizen: KaizenDetailDto
  onChanged: () => void
}

type DialogKind = "requestInfo" | "approve" | "reject" | "feasibility" | "close" | null

/** Every status-changing button for a Kaizen — visibility is gated by both status and role,
 * mirroring the same rules KaizenService enforces server-side (this is convenience only, the
 * backend is the source of truth and will reject anything not actually allowed). */
export function KaizenWorkflowActions({ kaizen, onChanged }: KaizenWorkflowActionsProps) {
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const { data: pillars } = useAsyncData(() => masterDataApi.getPillars(), [])

  const [openDialog, setOpenDialog] = useState<DialogKind>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [comment, setComment] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [analysisRating, setAnalysisRating] = useState(3)
  const [pillarId, setPillarId] = useState<number | "">("")
  const [isBestPractice, setIsBestPractice] = useState(false)
  const [isPokaYoke, setIsPokaYoke] = useState(false)
  const [isFeasible, setIsFeasible] = useState(true)
  const [isResultConfirmed, setIsResultConfirmed] = useState(true)

  const canReview = hasRole("Approver", "Admin")
  const canSupervise = hasRole("Supervisor", "Admin")

  const isPendingApproval = kaizen.status === "SuggestionCreated" || kaizen.status === "SuggestionInfoRequested"
  const isPendingFeasibility = kaizen.status === "SuggestionApproved"
  const isPendingClose = kaizen.status === "KaizenCheck"

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

  const hasWorkflowActions = (isPendingApproval && canReview) || (isPendingFeasibility && canSupervise) || (isPendingClose && canSupervise)

  if (!hasWorkflowActions) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isPendingApproval && canReview && (
          <>
            <Button variant="outline" onClick={() => setOpenDialog("requestInfo")}>
              Request more information
            </Button>
            <Button onClick={() => setOpenDialog("approve")}>Approve suggestion</Button>
            <Button variant="destructive" onClick={() => setOpenDialog("reject")}>
              Reject suggestion
            </Button>
          </>
        )}

        {isPendingFeasibility && canSupervise && <Button onClick={() => setOpenDialog("feasibility")}>Record feasibility</Button>}

        {isPendingClose && canSupervise && <Button onClick={() => setOpenDialog("close")}>Close Kaizen</Button>}
      </CardContent>

      {/* Request info */}
      <Dialog open={openDialog === "requestInfo"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request more information</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ri-comment">Comment</Label>
            <Textarea id="ri-comment" value={comment} onChange={(event) => setComment(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || !comment}
              onClick={() => runAction(() => kaizenApi.requestInfo(kaizen.kaizenId, { comment }), "Information requested.")}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve */}
      <Dialog open={openDialog === "approve"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve suggestion</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pillarId">Pillar</Label>
              <Select id="pillarId" value={pillarId} onChange={(event) => setPillarId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Select a pillar</option>
                {pillars?.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="analysisRating">Analysis quality rating (1-5)</Label>
              <Select id="analysisRating" value={analysisRating} onChange={(event) => setAnalysisRating(Number(event.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isBestPractice} onCheckedChange={(checked) => setIsBestPractice(checked === true)} />
              Best practice
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isPokaYoke} onCheckedChange={(checked) => setIsPokaYoke(checked === true)} />
              Poka-yoke
            </label>
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || pillarId === ""}
              onClick={() =>
                runAction(
                  () =>
                    kaizenApi.approve(kaizen.kaizenId, {
                      analysisQualityRatingStars: analysisRating,
                      pillarId: Number(pillarId),
                      isBestPractice,
                      isPokaYoke,
                    }),
                  "Kaizen approved.",
                )
              }
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={openDialog === "reject"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject suggestion</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rejectReason">Reason</Label>
              <Textarea id="rejectReason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rejectComment">Comment</Label>
              <Textarea id="rejectComment" value={comment} onChange={(event) => setComment(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isSubmitting || !rejectReason || !comment}
              onClick={() =>
                runAction(
                  () => kaizenApi.reject(kaizen.kaizenId, { rejectReason, rejectComment: comment }),
                  "Kaizen rejected.",
                )
              }
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feasibility */}
      <Dialog open={openDialog === "feasibility"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record feasibility</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isFeasible} onCheckedChange={(checked) => setIsFeasible(checked === true)} />
              Feasible
            </label>
            {!isFeasible && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feasibilityComment">Comment (required when not feasible)</Label>
                <Textarea id="feasibilityComment" value={comment} onChange={(event) => setComment(event.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || (!isFeasible && !comment)}
              onClick={() =>
                runAction(
                  () => kaizenApi.setFeasibility(kaizen.kaizenId, { isFeasible, comment: isFeasible ? null : comment }),
                  "Feasibility recorded.",
                )
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close */}
      <Dialog open={openDialog === "close"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Kaizen</DialogTitle>
          </DialogHeader>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isResultConfirmed} onCheckedChange={(checked) => setIsResultConfirmed(checked === true)} />
            Confirm result (counts toward KPIs)
          </label>
          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => runAction(() => kaizenApi.close(kaizen.kaizenId, { isResultConfirmed }), "Kaizen closed.")}
            >
              Close Kaizen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
