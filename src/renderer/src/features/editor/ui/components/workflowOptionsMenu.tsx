import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import { Switch } from '@renderer/components/ui/switch'
import { exportWorkflow } from '@renderer/features/workflows/functions/exportWorkflow'
import { isSuccess } from '@shared/@types/ipc-response'
import { useNavigate } from '@tanstack/react-router'
import {
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface WorkflowOptionsMenuProps {
  workflowId: string
  workflowName: string
  headless?: boolean
  onImport?: () => void
  onDelete?: () => void
  onSettings?: () => void
}

export function WorkflowOptionsMenu({
  workflowId,
  workflowName: _workflowName,
  headless = true,
  onImport,
  onDelete,
  onSettings,
}: WorkflowOptionsMenuProps) {
  void _workflowName
  const navigate = useNavigate()
  const [isVisualMode, setIsVisualMode] = useState(!headless)
  const [isExporting, setIsExporting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isSavingHeadless, setIsSavingHeadless] = useState(false)

  // Sync state with prop
  useEffect(() => {
    setIsVisualMode(!headless)
  }, [headless])

  const handleVisualModeChange = async (checked: boolean) => {
    if (isSavingHeadless) return

    try {
      setIsSavingHeadless(true)
      setIsVisualMode(checked)

      // Save to database (headless is the opposite of visual mode)
      await window.api.workflows.updateHeadless(workflowId, !checked)
    } catch (error) {
      console.error('Failed to update visual mode:', error)
      // Revert on error
      setIsVisualMode(!checked)
    } finally {
      setIsSavingHeadless(false)
    }
  }

  const handleExport = async () => {
    if (isExporting) return

    try {
      setIsExporting(true)
      await exportWorkflow(workflowId)
    } catch (error) {
      console.error('Failed to export workflow:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = () => {
    onImport?.()
  }

  const handleDuplicate = async () => {
    if (isDuplicating) return

    try {
      setIsDuplicating(true)
      const result = await window.api.workflows.duplicate(workflowId)

      if (isSuccess(result)) {
        // Navigate to the new duplicated workflow
        navigate({
          to: '/workflows/$workflowId',
          params: { workflowId: result.data.workflowId },
        })
      } else {
        console.error('Failed to duplicate workflow:', result.error.message)
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = () => {
    onDelete?.()
  }

  const handleSettings = () => {
    onSettings?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-lg"
          variant="outline"
          className="bg-accent! border-primary! border-2!"
        >
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56"
      >
        {/* Settings */}
        <DropdownMenuItem
          onClick={handleSettings}
          disabled={!onSettings}
        >
          <SettingsIcon className="size-4" />
          <span>Workflow Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Visual Mode Toggle */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <EyeIcon className="size-4 text-muted-foreground" />
            <span className="text-sm">Visual Mode</span>
          </div>

          <Switch
            checked={isVisualMode}
            onCheckedChange={handleVisualModeChange}
            disabled={isSavingHeadless}
            aria-label="Toggle visual mode"
          />
        </div>

        <DropdownMenuSeparator />

        {/* Export/Import */}
        <DropdownMenuItem
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="size-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Workflow'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleImport}
          disabled={!onImport}
        >
          <UploadIcon className="size-4" />
          <span>Import Workflow</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Duplicate/Delete */}
        <DropdownMenuItem
          onClick={handleDuplicate}
          disabled={isDuplicating}
        >
          <CopyIcon className="size-4" />
          <span>{isDuplicating ? 'Duplicating...' : 'Duplicate Workflow'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDelete}
          disabled={!onDelete}
          variant="destructive"
        >
          <Trash2Icon className="size-4" />
          <span>Delete Workflow</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
