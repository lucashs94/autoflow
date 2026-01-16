import { ipcRenderer } from 'electron'

export const history = {
  createExecution: (params: {
    id: string
    workflow_id: string
    workflow_name: string
    started_at: number
    status: 'running'
  }) => ipcRenderer.invoke('history:createExecution', params),

  finishExecution: (params: {
    id: string
    finished_at: number
    duration: number
    status: 'success' | 'failed' | 'cancelled'
    final_context: Record<string, unknown>
    error?: string
  }) => ipcRenderer.invoke('history:finishExecution', params),

  logNodeExecution: (params: {
    id: string
    execution_id: string
    node_id: string
    node_name: string
    node_type: string
    status: 'loading' | 'success' | 'error' | 'cancelled'
    started_at: number
    finished_at?: number
    duration?: number
    context_snapshot: Record<string, unknown>
    error?: string
    error_code?: string
  }) => ipcRenderer.invoke('history:logNodeExecution', params),

  getAllExecutions: (limit?: number) =>
    ipcRenderer.invoke('history:getAllExecutions', limit),

  getExecutionById: (id: string) =>
    ipcRenderer.invoke('history:getExecutionById', id),

  getNodeLogsByExecution: (executionId: string) =>
    ipcRenderer.invoke('history:getNodeLogsByExecution', executionId),

  getExecutionsByWorkflow: (workflowId: string) =>
    ipcRenderer.invoke('history:getExecutionsByWorkflow', workflowId),

  getWorkflowStats: (workflowId: string) =>
    ipcRenderer.invoke('history:getWorkflowStats', workflowId),
}
