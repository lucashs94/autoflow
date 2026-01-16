import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@renderer/components/ui/alert-dialog'
import { isSuccess } from '@shared/@types/ipc-response'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

interface DeleteWorkflowDialogProps {
  workflowId: string
  workflowName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteWorkflowDialog({
  workflowId,
  workflowName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteWorkflowDialogProps) {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      const result = await window.api.workflows.delete(workflowId)

      if (isSuccess(result)) {
        onOpenChange(false)
        if (onDeleted) {
          onDeleted()
        } else {
          // Navigate to workflows list (default behavior from editor)
          navigate({ to: '/workflows' })
        }
      } else {
        console.error('Failed to delete workflow:', result.error.message)
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-bold">"{workflowName}"</span>?
            <p className="mt-4 text-destructive/70 italic">
              Warning: This action cannot be undone and all workflow data will
              be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
