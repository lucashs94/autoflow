import { Button } from '@renderer/components/ui/button'
import { useExecuteWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { FlaskConicalIcon } from 'lucide-react'

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
    <Button
      size={'lg'}
      onClick={handleExecute}
      disabled={executeWorkflow.isPending || hasChanges}
      className="disabled:cursor-not-allowed! cursor-pointer!"
    >
      <FlaskConicalIcon />
      Execute Workflow
    </Button>
  )
}
