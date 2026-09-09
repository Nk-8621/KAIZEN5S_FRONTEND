import { useState } from "react"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useAsyncData } from "@/hooks/useAsyncData"
import { kaizenApi } from "@/api/kaizen"
import { masterDataApi } from "@/api/masterData"
import { ApiError } from "@/api/client"
import { formatCurrency } from "@/lib/utils"
import type { KaizenCostDto, KaizenSavingDto } from "@/types/kaizen"

interface KaizenCostsSavingsTabProps {
  kaizenId: number
  savings: KaizenSavingDto[]
  costs: KaizenCostDto[]
  onChanged: () => void
}

export function KaizenCostsSavingsTab({ kaizenId, savings, costs, onChanged }: KaizenCostsSavingsTabProps) {
  const { hasRole } = useAuth()
  const canEdit = hasRole("Supervisor", "Admin")

  return (
    <div className="flex flex-col gap-4">
      <SavingsCard kaizenId={kaizenId} savings={savings} canEdit={canEdit} onChanged={onChanged} />
      <CostsCard kaizenId={kaizenId} costs={costs} canEdit={canEdit} onChanged={onChanged} />
    </div>
  )
}

function SavingsCard({
  kaizenId,
  savings,
  canEdit,
  onChanged,
}: {
  kaizenId: number
  savings: KaizenSavingDto[]
  canEdit: boolean
  onChanged: () => void
}) {
  const { toast } = useToast()
  const { data: categories } = useAsyncData(() => masterDataApi.getSavingCategories(), [])
  const [isOpen, setIsOpen] = useState(false)
  const [savingCategoryId, setSavingCategoryId] = useState<number | "">("")
  const [quantity, setQuantity] = useState("0")
  const [hardValue, setHardValue] = useState("0")
  const [virtualValue, setVirtualValue] = useState("0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAdd() {
    setIsSubmitting(true)
    try {
      await kaizenApi.addSaving(kaizenId, {
        savingCategoryId: Number(savingCategoryId),
        quantity: Number(quantity),
        hardValue: Number(hardValue),
        virtualValue: Number(virtualValue),
      })
      toast({ title: "Saving recorded." })
      setIsOpen(false)
      onChanged()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not record this saving."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Savings</CardTitle>
        {canEdit && (
          <Button size="sm" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4" />
            Add saving
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {savings.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No savings recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Hard value</TableHead>
                <TableHead className="text-right">Virtual value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.map((saving) => (
                <TableRow key={saving.kaizenSavingId}>
                  <TableCell>{saving.savingCategoryName}</TableCell>
                  <TableCell className="text-right tabular-nums">{saving.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(saving.hardValue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(saving.virtualValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add saving</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="saving-category">Category</Label>
              <Select
                id="saving-category"
                value={savingCategoryId}
                onChange={(event) => setSavingCategoryId(event.target.value ? Number(event.target.value) : "")}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="saving-quantity">Quantity</Label>
                <Input id="saving-quantity" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="saving-hard-value">Hard value</Label>
                <Input id="saving-hard-value" type="number" value={hardValue} onChange={(event) => setHardValue(event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="saving-virtual-value">Virtual value</Label>
                <Input
                  id="saving-virtual-value"
                  type="number"
                  value={virtualValue}
                  onChange={(event) => setVirtualValue(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || savingCategoryId === ""} onClick={handleAdd}>
              Add saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CostsCard({
  kaizenId,
  costs,
  canEdit,
  onChanged,
}: {
  kaizenId: number
  costs: KaizenCostDto[]
  canEdit: boolean
  onChanged: () => void
}) {
  const { toast } = useToast()
  const { data: categories } = useAsyncData(() => masterDataApi.getCostCategories(), [])
  const [isOpen, setIsOpen] = useState(false)
  const [costCategoryId, setCostCategoryId] = useState<number | "">("")
  const [quantity, setQuantity] = useState("0")
  const [value, setValue] = useState("0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAdd() {
    setIsSubmitting(true)
    try {
      await kaizenApi.addCost(kaizenId, { costCategoryId: Number(costCategoryId), quantity: Number(quantity), value: Number(value) })
      toast({ title: "Cost recorded." })
      setIsOpen(false)
      onChanged()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not record this cost."
      toast({ title: "Save failed", description: message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Costs</CardTitle>
        {canEdit && (
          <Button size="sm" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4" />
            Add cost
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {costs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No costs recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.map((cost) => (
                <TableRow key={cost.kaizenCostId}>
                  <TableCell>{cost.costCategoryName}</TableCell>
                  <TableCell className="text-right tabular-nums">{cost.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(cost.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add cost</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-category">Category</Label>
              <Select
                id="cost-category"
                value={costCategoryId}
                onChange={(event) => setCostCategoryId(event.target.value ? Number(event.target.value) : "")}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cost-quantity">Quantity</Label>
                <Input id="cost-quantity" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cost-value">Value</Label>
                <Input id="cost-value" type="number" value={value} onChange={(event) => setValue(event.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || costCategoryId === ""} onClick={handleAdd}>
              Add cost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
