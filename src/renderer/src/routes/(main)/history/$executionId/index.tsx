import { createFileRoute } from '@tanstack/react-router'
import { HistoryDetail } from '@renderer/features/history/ui/screens/historyDetail'

export const Route = createFileRoute('/(main)/history/$executionId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { executionId } = Route.useParams()

  return <HistoryDetail executionId={executionId} />
}
