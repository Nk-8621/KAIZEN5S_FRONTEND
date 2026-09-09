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
import { useAsyncData } from "@/hooks/useAsyncData"
import { masterDataApi } from "@/api/masterData"
import { ApiError } from "@/api/client"
import type { AreaDto, UpsertLookupRequest } from "@/types/masterData"

const EMPTY_FORM: UpsertLookupRequest = { name: "", code: "", isActive: true }

/** Areas are scoped to a Site (required) with an optional Line — the one master-data entity
 * with two scope dimensions, so it gets its own card rather than fitting ScopedLookupCard's
 * single-parent shape. */
export function AreasCard({ siteId, onSiteChange, siteOptions }: { siteId: number | ""; onSiteChange: (id: number | "") => void; siteOptions: { id: number; name: string }[] | undefined }) {
  const { toast } = useToast()
  const { data: areas, isLoading, error, reload } = useAsyncData(() => masterDataApi.getAreas(siteId || null), [siteId])
  const { data: lines } = useAsyncData(() => masterDataApi.getLines(siteId || null), [siteId])

  const [editingItem, setEditingItem] = useState<AreaDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<UpsertLookupRequest>(EMPTY_FORM)
  const [lineId, setLineId] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateDialog() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setLineId("")
    setIsDialogOpen(true)
  }

  function openEditDialog(item: AreaDto) {
    setEditingItem(item)
    setForm({ name: item.name, code: item.code ?? "", isActive: item.isActive })
    setLineId(item.lineId ?? "")
    setIsDialogOpen(true)
  }

  async function handleSave() {
    setIsSubmitting(true)
    try {
      if (editingItem) {
        await masterDataApi.updateArea(editingItem.id, form)
        toast({ title: "Area updated" })
      } else {
        if (!siteId) {
          return
        }
        await masterDataApi.createArea(siteId, lineId || null, form)
        toast({ title: "Area created" })
      }
      setIsDialogOpen(false)
      reload()
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "Could not save this area."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    const isConfirmed = window.confirm("Delete this area? This cannot be undone.")
    if (!isConfirmed) {
      return
    }
    try {
      await masterDataApi.deleteArea(id)
      toast({ title: "Area deleted" })
      reload()
    } catch (deleteError) {
      const message = deleteError instanceof ApiError ? deleteError.message : "Could not delete this area."
      toast({ title: "Delete failed", description: message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Areas</CardTitle>
        <Button size="sm" onClick={openCreateDialog} disabled={!siteOptions || siteOptions.length === 0}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="w-64">
          <Select value={siteId} onChange={(event) => onSiteChange(event.target.value ? Number(event.target.value) : "")}>
            <option value="">All sites</option>
            {siteOptions?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>

        {isLoading && <LoadingState label="Loading…" />}
        {error && <ErrorState message={error} />}
        {areas && areas.length === 0 && <EmptyState title="Nothing here yet" />}
        {areas && areas.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.code ?? "—"}</TableCell>
                  <TableCell>{lines?.find((line) => line.id === area.lineId)?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={area.isActive ? "success" : "muted"}>{area.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(area)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(area.id)}>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} area</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area-name">Name</Label>
              <Input id="area-name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area-code">Code</Label>
              <Input id="area-code" value={form.code ?? ""} onChange={(event) => setForm((previous) => ({ ...previous, code: event.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area-line">Line (optional)</Label>
              <Select id="area-line" value={lineId} onChange={(event) => setLineId(event.target.value ? Number(event.target.value) : "")}>
                <option value="">Not scoped to a line</option>
                {lines?.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isActive} onCheckedChange={(checked) => setForm((previous) => ({ ...previous, isActive: checked === true }))} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !form.name || (!editingItem && !siteId)} onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
