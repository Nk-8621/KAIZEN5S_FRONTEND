import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { actionsApi } from "@/api/actions"
import { ApiError } from "@/api/client"
import type { ActionDto } from "@/types/actions"

interface ActionRowProps {
  kaizenId: number
  action: ActionDto
  onChanged: () => void
}

type DialogKind = "assign" | "complete" | "rateExecution" | null

/**
 * The state-specific controls for one Action row. Responsible-user assignment uses a plain
 * numeric User ID field — BuildApp.Api has no "list users" endpoint yet (ANALYSIS.md doesn't
 * call for one), so a name-search picker isn't possible until that endpoint exists; this is a
 * known, flagged limitation rather than a missed feature.
 */
export function ActionRow({ kaizenId, action, onChanged }: ActionRowProps) {
  const { hasRole, user } = useAuth()
  const { toast } = useToast()

  const [openDialog, setOpenDialog] = useState<DialogKind>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responsibleUserId, setResponsibleUserId] = useState("")
  const [executionDescription, setExecutionDescription] = useState("")
  const [ratingStars, setRatingStars] = useState(4)

  async function run(action: () => Promise<unknown>, successMessage: string) {
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

  const canManage = hasRole("Supervisor", "Admin")
  const isResponsibleUser = user?.userId === action.responsibleUserId
  const canComplete = isResponsibleUser || hasRole("Implementor", "Admin")

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {action.responsibleUserName && <span className="text-muted-foreground">Assigned to {action.responsibleUserName}</span>}

      {canManage && !action.responsibleUserId && (
        <Button size="sm" variant="outline" onClick={() => setOpenDialog("assign")}>
          Assign
        </Button>
      )}

      {canManage && !action.isApprovedBySupervisor && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => run(() => actionsApi.approveBySupervisor(kaizenId, action.actionId, { approve: true }), "Action approved.")}
        >
          Approve
        </Button>
      )}

      {canComplete && action.status === "Assigned" && (
        <Button size="sm" variant="outline" onClick={() => setOpenDialog("complete")}>
          Mark complete
        </Button>
      )}

      {action.status === "Check" && (
        <Button size="sm" variant="outline" onClick={() => setOpenDialog("rateExecution")}>
          Rate execution
        </Button>
      )}

      <Dialog open={openDialog === "assign"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign action</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsible-user-id">Responsible user ID</Label>
            <Input
              id="responsible-user-id"
              type="number"
              value={responsibleUserId}
              onChange={(event) => setResponsibleUserId(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || !responsibleUserId}
              onClick={() =>
                run(
                  () => actionsApi.assign(kaizenId, action.actionId, { responsibleUserId: Number(responsibleUserId) }),
                  "Action assigned.",
                )
              }
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "complete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark action complete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="execution-description">Execution description</Label>
            <Textarea
              id="execution-description"
              value={executionDescription}
              onChange={(event) => setExecutionDescription(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting || !executionDescription}
              onClick={() => run(() => actionsApi.complete(kaizenId, action.actionId, { executionDescription }), "Action marked complete.")}
            >
              Mark complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "rateExecution"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate execution quality</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rating-stars">Rating (1-5) — below the configured threshold sends it back for rework</Label>
            <Input
              id="rating-stars"
              type="number"
              min={1}
              max={5}
              value={ratingStars}
              onChange={(event) => setRatingStars(Number(event.target.value))}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => run(() => actionsApi.rateExecution(kaizenId, action.actionId, { ratingStars }), "Rating recorded.")}
            >
              Submit rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
