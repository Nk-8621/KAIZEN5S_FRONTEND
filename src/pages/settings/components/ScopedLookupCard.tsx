import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { ApiError } from "@/api/client"
import type { LookupDto, UpsertLookupRequest } from "@/types/masterData"

interface ScopedLookupCardProps {
  title: string
  parentLabel: string
  parentOptions: LookupDto[] | undefined
  parentId: number | ""
  onParentChange: (id: number | "") => void
  items: LookupDto[] | null
  isLoading: boolean
  error: string | null
  onCreate: (parentId: number, request: UpsertLookupRequest) => Promise<unknown>
  onUpdate: (id: number, request: UpsertLookupRequest) => Promise<unknown>
  onDelete: (id: number) => Promise<unknown>
  onChanged: () => void
}

const EMPTY_FORM: UpsertLookupRequest = { name: "", code: "", isActive: true }

/** Master data scoped to a single parent (Lines→Site, Departments→Site, Machines→Line) — the
 * parent selector both filters the list and supplies the required parent ID on create. */
export function ScopedLookupCard({
  title,
  parentLabel,
  parentOptions,
  parentId,
  onParentChange,
  items,
  isLoading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onChanged,
}: ScopedLookupCardProps) {
  const { toast } = useToast()
  const [editingItem, setEditingItem] = useState<LookupDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<UpsertLookupRequest>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateDialog() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  function openEditDialog(item: LookupDto) {
    setEditingItem(item)
    setForm({ name: item.name, code: item.code ?? "", isActive: item.isActive })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    setIsSubmitting(true)
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, form)
        toast({ title: "Record updated" })
      } else {
        if (!parentId) {
          return
        }
        await onCreate(parentId, form)
        toast({ title: "Record created" })
      }
      setIsDialogOpen(false)
      onChanged()
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "Could not save this record."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    const isConfirmed = window.confirm("Delete this record? This cannot be undone.")
    if (!isConfirmed) {
      return
    }
    try {
      await onDelete(id)
      toast({ title: "Record deleted" })
      onChanged()
    } catch (deleteError) {
      const message = deleteError instanceof ApiError ? deleteError.message : "Could not delete this record."
      toast({ title: "Delete failed", description: message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" onClick={openCreateDialog} disabled={!parentOptions || parentOptions.length === 0}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-64">
          <Select value={parentId} onChange={(event) => onParentChange(event.target.value ? Number(event.target.value) : "")}>
            <option value="">All {parentLabel.toLowerCase()}s</option>
            {parentOptions?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>

        {isLoading && <LoadingState label="Loading…" />}
        {error && <ErrorState message={error} />}
        {items && items.length === 0 && <EmptyState title="Nothing here yet" />}
        {items && items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "success" : "muted"}>{item.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} record</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {!editingItem && (
              <p className="text-sm text-muted-foreground">
                {parentLabel}: <span className="font-medium text-foreground">{parentOptions?.find((option) => option.id === parentId)?.name ?? "—"}</span>
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scoped-lookup-name">Name</Label>
              <Input id="scoped-lookup-name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scoped-lookup-code">Code</Label>
              <Input
                id="scoped-lookup-code"
                value={form.code ?? ""}
                onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isActive} onCheckedChange={(checked) => setForm((previous) => ({ ...previous, isActive: checked === true }))} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !form.name || (!editingItem && !parentId)} onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
