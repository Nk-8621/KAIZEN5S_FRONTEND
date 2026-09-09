import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAsyncData } from "@/hooks/useAsyncData"
import { fiveSApi } from "@/api/fiveS"
import { masterDataApi } from "@/api/masterData"
import { ApiError } from "@/api/client"
import type { QuestionnaireListItemDto } from "@/types/fiveS"

interface StartAuditDialogProps {
  questionnaire: QuestionnaireListItemDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Kicks off a new AuditInstance for a questionnaire, letting the Area Owner narrow the scope
 * to a specific Line/Area if the questionnaire itself isn't already scoped to one. */
export function StartAuditDialog({ questionnaire, open, onOpenChange }: StartAuditDialogProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])
  const { data: areas } = useAsyncData(() => masterDataApi.getAreas(), [])

  const [lineId, setLineId] = useState<number | "">("")
  const [areaId, setAreaId] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleStart() {
    setIsSubmitting(true)
    try {
      const auditInstance = await fiveSApi.startAuditInstance(questionnaire.questionnaireId, {
        lineId: lineId || null,
        areaId: areaId || null,
      })
      toast({ title: "Audit started" })
      onOpenChange(false)
      navigate(`/five-s/audits/${auditInstance.auditInstanceId}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not start this audit."
      toast({ title: "Start failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start audit — {questionnaire.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit-line">Line (optional)</Label>
            <Select id="audit-line" value={lineId} onChange={(event) => setLineId(event.target.value ? Number(event.target.value) : "")}>
              <option value="">Not specified</option>
              {lines?.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit-area">Area (optional)</Label>
            <Select id="audit-area" value={areaId} onChange={(event) => setAreaId(event.target.value ? Number(event.target.value) : "")}>
              <option value="">Not specified</option>
              {areas?.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting} onClick={handleStart}>
            Start audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
