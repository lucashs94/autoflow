import { WorkflowsList } from '@renderer/features/workflows/ui/screens/workflowsList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/workflows/')({
  component: Workflows,
})

function Workflows() {
  return <WorkflowsList />
}
