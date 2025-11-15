import { Button } from '@renderer/components/ui/button'
import { SaveIcon } from 'lucide-react'

export function SaveWorkflowBtn({ workflowId }: { workflowId: string }) {
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
      <SaveIcon />
      Save
    </Button>
  )
}
