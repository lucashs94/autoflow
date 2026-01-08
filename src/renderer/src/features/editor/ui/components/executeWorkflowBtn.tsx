import { Button } from '@renderer/components/ui/button'
import { useExecuteWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { FlaskConicalIcon, LoaderIcon, SquareIcon } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

export function ExecuteWorkflowBtn({
  workflowId,
  hasChanges,
}: {
  workflowId: string
  hasChanges: boolean
}) {
  const executeWorkflow = useExecuteWorkflow()
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleExecute = () => {
    // Create new AbortController for this execution
    abortControllerRef.current = new AbortController()

    executeWorkflow.mutate({
      workflowId,
      signal: abortControllerRef.current.signal,
    })
  }

  const handleCancel = async () => {
    console.log('🛑 Cancel button clicked')

    // Abort the workflow execution in renderer
    abortControllerRef.current?.abort()
    console.log('✅ Renderer signal aborted')

    // Abort any in-flight browser operations in main process
    await window.api.executions.abort()
    console.log('✅ Main process aborted')

    // Show notification
    toast.info('Workflow cancelled')
  }

  return (
    <div className="flex gap-2">
      <Button
        size={'lg'}
        onClick={handleExecute}
        disabled={executeWorkflow.isPending || hasChanges}
        className="disabled:cursor-not-allowed! cursor-pointer! relative"
      >
        {executeWorkflow.isPending ? (
          <LoaderIcon className="animate-spin" />
        ) : (
          <FlaskConicalIcon />
        )}
        Execute Workflow
      </Button>

      {executeWorkflow.isPending && (
        <Button
          size={'lg'}
          onClick={handleCancel}
          variant={'destructive'}
          className="disabled:cursor-not-allowed! cursor-pointer! animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-500 ease-out"
        >
          <SquareIcon />
        </Button>
      )}
    </div>
  )
}
