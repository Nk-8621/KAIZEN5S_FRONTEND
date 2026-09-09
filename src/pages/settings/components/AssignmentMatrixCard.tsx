import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { useAsyncData } from "@/hooks/useAsyncData"
import { masterDataApi } from "@/api/masterData"
import { ApiError } from "@/api/client"

const ROLE_TYPES = ["Approver", "Supervisor"] as const

/** Per-Line Approver/Supervisor routing for Kaizen review (ANALYSIS.md §11 item 8 — resolved as
 * strictly per production Line, not a hierarchical approval cascade). */
export function AssignmentMatrixCard() {
  const { toast } = useToast()
  const [lineFilter, setLineFilter] = useState<number | "">("")
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(), [])
  const { data: entries, isLoading, error, reload } = useAsyncData(() => masterDataApi.getAssignmentMatrix(lineFilter || null), [lineFilter])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lineId, setLineId] = useState<number | "">("")
  const [userId, setUserId] = useState("")
  const [roleType, setRoleType] = useState<string>(ROLE_TYPES[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateDialog() {
    setLineId("")
    setUserId("")
    setRoleType(ROLE_TYPES[0])
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!lineId || !userId) {
      return
    }
    setIsSubmitting(true)
    try {
      await masterDataApi.addAssignmentMatrixEntry({ lineId, userId: Number(userId), roleType })
      toast({ title: "Assignment added" })
      setIsDialogOpen(false)
      reload()
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "Could not save this assignment."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    const isConfirmed = window.confirm("Remove this assignment? This cannot be undone.")
    if (!isConfirmed) {
      return
    }
    try {
      await masterDataApi.removeAssignmentMatrixEntry(id)
      toast({ title: "Assignment removed" })
      reload()
    } catch (deleteError) {
      const message = deleteError instanceof ApiError ? deleteError.message : "Could not remove this assignment."
      toast({ title: "Delete failed", description: message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Assignment Matrix</CardTitle>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-64">
          <Select value={lineFilter} onChange={(event) => setLineFilter(event.target.value ? Number(event.target.value) : "")}>
            <option value="">All lines</option>
            {lines?.map((line) => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </Select>
        </div>

        {isLoading && <LoadingState label="Loading…" />}
        {error && <ErrorState message={error} />}
        {entries && entries.length === 0 && <EmptyState title="No assignments yet" />}
        {entries && entries.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.assignmentMatrixEntryId}>
                  <TableCell className="font-medium">{entry.lineName}</TableCell>
                  <TableCell>{entry.userName}</TableCell>
                  <TableCell>{entry.roleType}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(entry.assignmentMatrixEntryId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add assignment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-line">Line</Label>
              <Select id="assignment-line" value={lineId} onChange={(event) => setLineId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Select a line</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-user">User ID</Label>
              <Input id="assignment-user" type="number" value={userId} onChange={(event) => setUserId(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-role">Role</Label>
              <Select id="assignment-role" value={roleType} onChange={(event) => setRoleType(event.target.value)}>
                {ROLE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !lineId || !userId} onClick={handleSave}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
