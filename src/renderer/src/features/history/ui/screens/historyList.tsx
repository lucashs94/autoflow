import { EntityContainer } from '@renderer/components/entityContainer'
import { EntityList } from '@renderer/components/entityList'
import { Suspense } from 'react'
import { useExecutions } from '../../hooks/useHistory'
import { ExecutionHistory } from '../../types'
import { ExecutionItem } from '../components/executionItem'

export function HistoryList() {
  const { data: executions } = useExecutions(100)

  return (
    <EntityContainer className="bg-muted">
      <div className="flex flex-col h-full">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Execution History</h1>
            <p className="text-muted-foreground">View all workflow executions and their results</p>
          </div>
        </div>

        <div className="h-full py-6">
          <Suspense fallback={<div className="text-muted-foreground">Loading executions...</div>}>
            {executions && executions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No executions yet. Run a workflow to see it here.
              </div>
            ) : (
              <EntityList
                items={executions || []}
                getKey={(item: ExecutionHistory) => item.id}
                renderItem={(item: ExecutionHistory) => <ExecutionItem data={item} />}
              />
            )}
          </Suspense>
        </div>
      </div>
    </EntityContainer>
  )
}
