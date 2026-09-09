import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { CostCategoryDto, UpsertCostCategoryRequest } from "@/types/masterData"

const EMPTY_FORM: UpsertCostCategoryRequest = { name: "", unitOfMeasure: "", effectiveYear: null, isActive: true }

/** Kaizen CDBP cost categories (ANALYSIS.md §11 item 11 — seeded exactly as shown in the source deck). */
export function CostCategoriesCard() {
  const { toast } = useToast()
  const { data: categories, isLoading, error, reload } = useAsyncData(() => masterDataApi.getCostCategories(), [])

  const [editingItem, setEditingItem] = useState<CostCategoryDto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<UpsertCostCategoryRequest>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openCreateDialog() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  function openEditDialog(item: CostCategoryDto) {
    setEditingItem(item)
    setForm({ name: item.name, unitOfMeasure: item.unitOfMeasure ?? "", effectiveYear: item.effectiveYear, isActive: item.isActive })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    setIsSubmitting(true)
    try {
      if (editingItem) {
        await masterDataApi.updateCostCategory(editingItem.id, form)
        toast({ title: "Cost category updated" })
      } else {
        await masterDataApi.createCostCategory(form)
        toast({ title: "Cost category created" })
      }
      setIsDialogOpen(false)
      reload()
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : "Could not save this cost category."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    const isConfirmed = window.confirm("Delete this cost category? This cannot be undone.")
    if (!isConfirmed) {
      return
    }
    try {
      await masterDataApi.deleteCostCategory(id)
      toast({ title: "Cost category deleted" })
      reload()
    } catch (deleteError) {
      const message = deleteError instanceof ApiError ? deleteError.message : "Could not delete this cost category."
      toast({ title: "Delete failed", description: message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Cost categories</CardTitle>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingState label="Loading…" />}
        {error && <ErrorState message={error} />}
        {categories && categories.length === 0 && <EmptyState title="Nothing here yet" />}
        {categories && categories.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit of measure</TableHead>
                <TableHead>Effective year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.unitOfMeasure ?? "—"}</TableCell>
                  <TableCell>{category.effectiveYear ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "success" : "muted"}>{category.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} cost category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-category-name">Name</Label>
              <Input id="cost-category-name" value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-category-unit">Unit of measure</Label>
              <Input
                id="cost-category-unit"
                value={form.unitOfMeasure ?? ""}
                onChange={(event) => setForm((previous) => ({ ...previous, unitOfMeasure: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-category-year">Effective year</Label>
              <Input
                id="cost-category-year"
                type="number"
                value={form.effectiveYear ?? ""}
                onChange={(event) => setForm((previous) => ({ ...previous, effectiveYear: event.target.value ? Number(event.target.value) : null }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isActive} onCheckedChange={(checked) => setForm((previous) => ({ ...previous, isActive: checked === true }))} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !form.name} onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
