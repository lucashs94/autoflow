import { EntityContainer } from '@renderer/components/entityContainer'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useExecution, useNodeLogs } from '../../hooks/useHistory'
import { NodeExecutionLog } from '../../types'
import { ExecutionSummary } from '../components/executionSummary'
import { NodeLogItem } from '../components/nodeLogItem'

interface HistoryDetailProps {
  executionId: string
}

export function HistoryDetail({ executionId }: HistoryDetailProps) {
  const { data: execution, isLoading: loadingExecution } = useExecution(executionId)
  const { data: nodeLogs, isLoading: loadingLogs } = useNodeLogs(executionId)

  if (loadingExecution || loadingLogs) {
    return (
      <EntityContainer className="bg-muted">
        <div className="text-center py-8 text-muted-foreground">Loading execution details...</div>
      </EntityContainer>
    )
  }

  if (!execution) {
    return (
      <EntityContainer className="bg-muted">
        <div className="text-center py-8 text-muted-foreground">Execution not found</div>
      </EntityContainer>
    )
  }

  return (
    <EntityContainer className="bg-muted">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/history">
            <Button
              variant="ghost"
              size="icon"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{execution.workflow_name}</h1>
            <p className="text-muted-foreground">Execution details and node logs</p>
          </div>
        </div>

        {/* Execution Summary */}
        <ExecutionSummary
          execution={execution}
          nodeCount={nodeLogs?.length || 0}
        />

        {/* Node Execution Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Node Execution Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!nodeLogs || nodeLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No node logs available</div>
            ) : (
              nodeLogs.map((log: NodeExecutionLog, index: number) => (
                <NodeLogItem
                  key={log.id}
                  log={log}
                  index={index}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Final Context */}
        {execution.final_context && (
          <Card>
            <CardHeader>
              <CardTitle>Final Context</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(JSON.parse(execution.final_context), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </EntityContainer>
  )
}
