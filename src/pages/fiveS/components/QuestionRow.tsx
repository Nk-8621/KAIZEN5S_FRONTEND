import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { fiveSApi } from "@/api/fiveS"
import { ApiError } from "@/api/client"
import { AddQuestionDialog } from "@/pages/fiveS/components/AddQuestionDialog"
import type { QuestionDto } from "@/types/fiveS"

interface QuestionRowProps {
  question: QuestionDto
  onChanged: () => void
}

export function QuestionRow({ question, onChanged }: QuestionRowProps) {
  const { toast } = useToast()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const isConfirmed = window.confirm(`Delete "${question.questionText}"? This cannot be undone.`)
    if (!isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      await fiveSApi.deleteQuestion(question.questionId)
      toast({ title: "Question deleted" })
      onChanged()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not delete this question."
      toast({ title: "Delete failed", description: message, variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Badge variant="outline">{question.category}</Badge>
      </TableCell>
      <TableCell className="max-w-md">{question.questionText}</TableCell>
      <TableCell>{question.isPhotoRequired ? "Required" : "Optional"}</TableCell>
      <TableCell className="text-right tabular-nums">{question.sortOrder}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={isDeleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>

      <AddQuestionDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        existingQuestion={question}
        nextSortOrder={question.sortOrder}
        onSave={(request) => fiveSApi.updateQuestion(question.questionId, request)}
        onSaved={onChanged}
      />
    </TableRow>
  )
}
