import { Button } from '@renderer/components/ui/button'
import { useExecuteWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { FlaskConicalIcon, LoaderIcon, SquareIcon } from 'lucide-react'

export function ExecuteWorkflowBtn({
  workflowId,
  hasChanges,
}: {
  workflowId: string
  hasChanges: boolean
}) {
  const executeWorkflow = useExecuteWorkflow()

  const handleExecute = () => {
    executeWorkflow.mutate(workflowId)
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
          onClick={() => {
            console.log('cancel')
          }}
          variant={'destructive'}
          className="disabled:cursor-not-allowed! cursor-pointer! animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-500 ease-out"
        >
          <SquareIcon />
        </Button>
      )}
    </div>
  )
}
