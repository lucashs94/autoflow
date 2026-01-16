import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import {
  importWorkflow,
  validateWorkflowFile,
} from '@renderer/features/workflows/functions/importWorkflow'
import { Edge, Node } from '@xyflow/react'
import { Loader2Icon, UploadIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

interface ImportWorkflowDialogProps {
  workflowId: string
  currentNodes: Node[]
  currentEdges: Edge[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess?: () => void
}

export function ImportWorkflowDialog({
  workflowId,
  currentNodes,
  currentEdges,
  open,
  onOpenChange,
  onImportSuccess,
}: ImportWorkflowDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const executeImport = useCallback(
    async (file: File) => {
      if (isImporting) return

      if (!validateWorkflowFile(file)) {
        setError('Please select a valid JSON file')
        return
      }

      try {
        setIsImporting(true)
        setError(null)

        await importWorkflow({
          file,
          workflowId,
          currentNodes,
          currentEdges,
        })

        // Close dialog and trigger reload
        onOpenChange(false)
        onImportSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import workflow')
        setIsImporting(false)
      }
    },
    [isImporting, workflowId, currentNodes, currentEdges, onOpenChange, onImportSuccess]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        executeImport(droppedFile)
      }
    },
    [executeImport]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        executeImport(selectedFile)
      }
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [executeImport]
  )

  const handleClose = () => {
    if (isImporting) return
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Workflow</DialogTitle>
          <DialogDescription>
            Select or drop a workflow JSON file to import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${error ? 'border-destructive' : ''}
              ${isImporting ? 'pointer-events-none opacity-50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isImporting && document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleInputChange}
              disabled={isImporting}
            />

            {isImporting ? (
              <div className="space-y-2">
                <Loader2Icon className="size-10 mx-auto text-primary animate-spin" />
                <p className="text-sm font-medium">Importing workflow...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadIcon className="size-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drop a JSON file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .json workflow files
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
