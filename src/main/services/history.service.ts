import {
  createExecution,
  finishExecution,
  logNodeExecution,
  getAllExecutions,
  getExecutionById,
  getNodeLogsByExecution,
  getExecutionsByWorkflow,
  getWorkflowStats,
  type CreateExecutionParams,
  type FinishExecutionParams,
  type LogNodeExecutionParams,
  type ExecutionHistory,
  type NodeExecutionLog,
} from '../db/history'
import {
  IPCResult,
  success,
  errorFromException,
  IPCErrorCode,
  IPCOperationError,
} from '../../shared/@types/ipc-response'

/**
 * Create a new execution record
 */
export function createExecutionService(params: CreateExecutionParams): IPCResult<void> {
  try {
    if (!params.id || !params.workflow_id || !params.workflow_name) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Missing required execution parameters'
      )
    }

    createExecution(params)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Finish an execution record with final data
 */
export function finishExecutionService(params: FinishExecutionParams): IPCResult<void> {
  try {
    if (!params.id) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Execution ID is required'
      )
    }

    finishExecution(params)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Log a node execution
 */
export function logNodeExecutionService(params: LogNodeExecutionParams): IPCResult<void> {
  try {
    if (!params.id || !params.execution_id || !params.node_id) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Missing required node execution parameters'
      )
    }

    logNodeExecution(params)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Get all executions (with optional limit)
 */
export function getAllExecutionsService(limit: number = 100): IPCResult<ExecutionHistory[]> {
  try {
    const executions = getAllExecutions(limit)
    return success(executions)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Get a single execution by ID
 */
export function getExecutionByIdService(id: string): IPCResult<ExecutionHistory> {
  try {
    if (!id) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Execution ID is required'
      )
    }

    const execution = getExecutionById(id)

    if (!execution) {
      throw new IPCOperationError(
        IPCErrorCode.NOT_FOUND,
        `Execution with id ${id} not found`,
        { executionId: id }
      )
    }

    return success(execution)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Get node logs for an execution
 */
export function getNodeLogsByExecutionService(
  executionId: string
): IPCResult<NodeExecutionLog[]> {
  try {
    if (!executionId) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Execution ID is required'
      )
    }

    const logs = getNodeLogsByExecution(executionId)
    return success(logs)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Get all executions for a workflow
 */
export function getExecutionsByWorkflowService(
  workflowId: string
): IPCResult<ExecutionHistory[]> {
  try {
    if (!workflowId) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Workflow ID is required'
      )
    }

    const executions = getExecutionsByWorkflow(workflowId)
    return success(executions)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

/**
 * Get execution statistics for a workflow
 */
export function getWorkflowStatsService(workflowId: string): IPCResult<any> {
  try {
    if (!workflowId) {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Workflow ID is required'
      )
    }

    const stats = getWorkflowStats(workflowId)
    return success(stats)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}
