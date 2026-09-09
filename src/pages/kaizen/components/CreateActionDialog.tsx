import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ApiError } from "@/api/client"
import type { ActionDto, CreateActionRequest } from "@/types/actions"

interface CreateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (request: CreateActionRequest) => Promise<ActionDto>
  onCreated: () => void
}

/** Shared "raise an Action/Tag" dialog — used from both the Kaizen Actions tab and the 5S
 * flagged-answer review screen, since CreateActionRequest is identical either way. */
export function CreateActionDialog({ open, onOpenChange, onCreate, onCreated }: CreateActionDialogProps) {
  const { toast } = useToast()
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      await onCreate({ description, priority, dueDate: dueDate || null })
      toast({ title: "Action created" })
      setDescription("")
      setDueDate("")
      onOpenChange(false)
      onCreated()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not create the action."
      toast({ title: "Action failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New action</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="action-description">Description</Label>
            <Textarea id="action-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="action-priority">Priority</Label>
            <Select id="action-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="action-due-date">Due date</Label>
            <Input id="action-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting || !description} onClick={handleCreate}>
            Create action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
