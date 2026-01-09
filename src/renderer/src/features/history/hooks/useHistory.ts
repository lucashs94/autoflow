import { useQuery } from '@tanstack/react-query'
import { isSuccess } from '@shared/@types/ipc-response'

export function useExecutions(limit: number = 100) {
  return useQuery({
    queryKey: ['executions', limit],
    queryFn: async () => {
      const result = await window.api.history.getAllExecutions(limit)
      if (!isSuccess(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
  })
}

export function useExecution(executionId: string) {
  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: async () => {
      const result = await window.api.history.getExecutionById(executionId)
      if (!isSuccess(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!executionId,
  })
}

export function useNodeLogs(executionId: string) {
  return useQuery({
    queryKey: ['execution-logs', executionId],
    queryFn: async () => {
      const result = await window.api.history.getNodeLogsByExecution(executionId)
      if (!isSuccess(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!executionId,
  })
}

export function useWorkflowStats(workflowId: string) {
  return useQuery({
    queryKey: ['workflow-stats', workflowId],
    queryFn: async () => {
      const result = await window.api.history.getWorkflowStats(workflowId)
      if (!isSuccess(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!workflowId,
  })
}
