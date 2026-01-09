export interface ExecutionHistory {
  id: string
  workflow_id: string
  workflow_name: string
  started_at: number
  finished_at: number | null
  duration: number | null
  status: 'running' | 'success' | 'failed' | 'cancelled'
  final_context: string | null
  error: string | null
}

export interface NodeExecutionLog {
  id: string
  execution_id: string
  node_id: string
  node_name: string
  node_type: string
  status: 'loading' | 'success' | 'error' | 'cancelled'
  started_at: number
  finished_at: number | null
  duration: number | null
  context_snapshot: string | null
  error: string | null
}
