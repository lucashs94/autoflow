import { Button } from '@renderer/components/ui/button'
import { FlaskConicalIcon } from 'lucide-react'

export function ExecuteWorkflowBtn({ workflowId }: { workflowId: string }) {
  // const executeWorkflow = useExecuteWorkflow()

  const handleExecute = () => {
    // executeWorkflow.mutate({ id: workflowId })
  }

  return (
    <Button
      size={'lg'}
      onClick={handleExecute}
      // disabled={executeWorkflow.isPending}
    >
      <FlaskConicalIcon />
      Execute Workflow
    </Button>
  )
}
