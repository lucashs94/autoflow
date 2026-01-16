import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import { isSuccess } from '@shared/@types/ipc-response'
import { useEffect, useState } from 'react'

interface WorkflowSettingsDialogProps {
  workflowId: string
  workflowName: string
  headless: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function WorkflowSettingsDialog({
  workflowId,
  workflowName,
  headless,
  open,
  onOpenChange,
  onSave,
}: WorkflowSettingsDialogProps) {
  const [name, setName] = useState(workflowName)
  const [isVisualMode, setIsVisualMode] = useState(!headless)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync state with props when dialog opens
  useEffect(() => {
    if (open) {
      setName(workflowName)
      setIsVisualMode(!headless)
      setError(null)
    }
  }, [open, workflowName, headless])

  const handleSave = async () => {
    if (isSaving) return

    if (!name.trim()) {
      setError('Workflow name cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Update name if changed
      if (name !== workflowName) {
        const nameResult = await window.api.workflows.updateWorkflowName(
          workflowId,
          name.trim()
        )
        if (!isSuccess(nameResult)) {
          throw new Error(nameResult.error.message)
        }
      }

      // Update headless if changed
      const newHeadless = !isVisualMode
      if (newHeadless !== headless) {
        const headlessResult = await window.api.workflows.updateHeadless(
          workflowId,
          newHeadless
        )
        if (!isSuccess(headlessResult)) {
          throw new Error(headlessResult.error.message)
        }
      }

      onOpenChange(false)
      onSave?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isSaving) return
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workflow Settings</DialogTitle>
          <DialogDescription>
            Configure the settings for this workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name"
              disabled={isSaving}
            />
          </div>

          {/* Visual Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="visual-mode">Visual Mode</Label>
              <p className="text-sm text-muted-foreground">
                Show browser window during execution
              </p>
            </div>
            <Switch
              id="visual-mode"
              checked={isVisualMode}
              onCheckedChange={setIsVisualMode}
              disabled={isSaving}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
