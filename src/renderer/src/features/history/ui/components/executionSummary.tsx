import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ExecutionHistory } from '../../types'
import { formatDuration } from '../../utils/formatters'
import { StatusBadge } from './statusBadge'

interface ExecutionSummaryProps {
  execution: ExecutionHistory
  nodeCount: number
}

export function ExecutionSummary({ execution, nodeCount }: ExecutionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="mt-1">
              <StatusBadge status={execution.status} />
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Started</div>
            <div className="mt-1">
              {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="mt-1">{formatDuration(execution.duration)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nodes Executed</div>
            <div className="mt-1">{nodeCount}</div>
          </div>
        </div>

        {execution.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="text-sm font-medium text-red-500">Error</div>
            <div className="text-sm mt-1">{execution.error}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
