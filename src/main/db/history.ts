import { getDb } from './index'

// Types
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
  error_code: string | null
}

export interface CreateExecutionParams {
  id: string
  workflow_id: string
  workflow_name: string
  started_at: number
  status: 'running'
}

export interface FinishExecutionParams {
  id: string
  finished_at: number
  duration: number
  status: 'success' | 'failed' | 'cancelled'
  final_context: Record<string, unknown>
  error?: string
}

export interface LogNodeExecutionParams {
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
}

// Database operations

/**
 * Create a new execution record
 */
export function createExecution(params: CreateExecutionParams): void {
  const stmt = getDb().prepare(`
    INSERT INTO execution_history (
      id, workflow_id, workflow_name, started_at, status
    ) VALUES (?, ?, ?, ?, ?)
  `)

  stmt.run(
    params.id,
    params.workflow_id,
    params.workflow_name,
    params.started_at,
    params.status
  )
}

/**
 * Finish an execution record with final data
 */
export function finishExecution(params: FinishExecutionParams): void {
  const stmt = getDb().prepare(`
    UPDATE execution_history
    SET finished_at = ?, duration = ?, status = ?, final_context = ?, error = ?
    WHERE id = ?
  `)

  stmt.run(
    params.finished_at,
    params.duration,
    params.status,
    JSON.stringify(params.final_context),
    params.error || null,
    params.id
  )
}

/**
 * Log a node execution
 */
export function logNodeExecution(params: LogNodeExecutionParams): void {
  const stmt = getDb().prepare(`
    INSERT INTO node_execution_log (
      id, execution_id, node_id, node_name, node_type, status,
      started_at, finished_at, duration, context_snapshot, error, error_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    params.id,
    params.execution_id,
    params.node_id,
    params.node_name,
    params.node_type,
    params.status,
    params.started_at,
    params.finished_at || null,
    params.duration || null,
    JSON.stringify(params.context_snapshot),
    params.error || null,
    params.error_code || null
  )
}

/**
 * Get all executions for a workflow
 */
export function getExecutionsByWorkflow(workflowId: string): ExecutionHistory[] {
  const stmt = getDb().prepare(`
    SELECT * FROM execution_history
    WHERE workflow_id = ?
    ORDER BY started_at DESC
  `)

  return stmt.all(workflowId) as ExecutionHistory[]
}

/**
 * Get all executions (with optional limit)
 */
export function getAllExecutions(limit: number = 100): ExecutionHistory[] {
  const stmt = getDb().prepare(`
    SELECT * FROM execution_history
    ORDER BY started_at DESC
    LIMIT ?
  `)

  return stmt.all(limit) as ExecutionHistory[]
}

/**
 * Get a single execution by ID
 */
export function getExecutionById(id: string): ExecutionHistory | null {
  const stmt = getDb().prepare(`
    SELECT * FROM execution_history
    WHERE id = ?
  `)

  return (stmt.get(id) as ExecutionHistory) || null
}

/**
 * Get node logs for an execution
 */
export function getNodeLogsByExecution(executionId: string): NodeExecutionLog[] {
  const stmt = getDb().prepare(`
    SELECT * FROM node_execution_log
    WHERE execution_id = ?
    ORDER BY started_at ASC
  `)

  return stmt.all(executionId) as NodeExecutionLog[]
}

/**
 * Delete old execution history (retention cleanup)
 */
export function deleteOldExecutions(olderThanDays: number): number {
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000

  const stmt = getDb().prepare(`
    DELETE FROM execution_history
    WHERE started_at < ?
  `)

  const result = stmt.run(cutoffTime)
  return result.changes
}

/**
 * Get execution statistics for a workflow
 */
export function getWorkflowStats(workflowId: string) {
  const stmt = getDb().prepare(`
    SELECT
      COUNT(*) as total_executions,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE NULL END) as avg_duration,
      MAX(started_at) as last_execution
    FROM execution_history
    WHERE workflow_id = ?
  `)

  return stmt.get(workflowId)
}
