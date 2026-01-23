import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import {
  getExecutor,
  registerAllExecutors,
} from '@renderer/features/tasks/registries/executorRegistry'
import { NodeType } from '@renderer/types/nodes'
import { ExecutorError, IPCErrorCode, isSuccess } from '@shared/@types/ipc-response'

const MAX_NODE_EXECUTIONS = 1000

/** Node types that are purely visual and don't participate in execution */
const NON_EXECUTABLE_NODES: NodeType[] = [NodeType.STICKY_NOTE]

export async function executeWorkflow(
  workflowId: string,
  signal?: AbortSignal
): Promise<{ workflowId: string; context: Record<string, unknown> }> {
  const result = await window.api.workflows.getOne(workflowId)

  if (!isSuccess(result)) {
    throw new Error(result.error.message)
  }

  const workflow = result.data

  // Create execution history record
  const executionId = crypto.randomUUID()
  const executionStartTime = Date.now()

  await window.api.history.createExecution({
    id: executionId,
    workflow_id: workflowId,
    workflow_name: workflow.name,
    started_at: executionStartTime,
    status: 'running',
  })

  // Find initial node
  const initialNode = workflow.nodes.find((n) => n.type === NodeType.INITIAL)
  if (!initialNode) {
    throw new Error(`Workflow must have an initial node!`)
  }

  // Reset all executable nodes to initial status (skip visual-only nodes like sticky notes)
  workflow.nodes.forEach((node) => {
    if (NON_EXECUTABLE_NODES.includes(node.type as NodeType)) return
    publishStatus({
      nodeId: node.id,
      status: 'initial',
    })
  })

  registerAllExecutors()

  // Find first node after INITIAL
  const firstEdge = workflow.edges.find((e) => e.source === initialNode.id)
  let currentNodeId: string | null = firstEdge?.target ?? null

  // Initialize context with workflow settings
  let context: Record<string, unknown> = {
    __headless: workflow.headless,
  }

  // Track executions per node (protection against infinite loops)
  const executionCount = new Map<string, number>()

  let executionFinished = false

  try {
    // Runtime execution loop - follows edges dynamically
    while (currentNodeId) {
      // Check if workflow was cancelled
      if (signal?.aborted) {
        console.log('Workflow cancelled')

        await window.api.history.finishExecution({
          id: executionId,
          finished_at: Date.now(),
          duration: Date.now() - executionStartTime,
          status: 'cancelled',
          final_context: context,
        })

        executionFinished = true

        return {
          workflowId,
          context,
        }
      }

      // Find current node
      const node = workflow.nodes.find((n) => n.id === currentNodeId)
      if (!node) {
        console.warn(`Node ${currentNodeId} not found, stopping execution`)
        break
      }

      // Skip non-executable nodes (e.g., sticky notes) - they're visual only
      if (NON_EXECUTABLE_NODES.includes(node.type as NodeType)) {
        console.warn(`Skipping non-executable node ${node.type}`)
        // Find next node from outgoing edges and continue
        const outgoingEdge = workflow.edges.find((e) => e.source === currentNodeId)
        currentNodeId = outgoingEdge?.target ?? null
        continue
      }

      // Protection against infinite loops
      const count = (executionCount.get(currentNodeId) ?? 0) + 1
      executionCount.set(currentNodeId, count)

      if (count > MAX_NODE_EXECUTIONS) {
        throw new Error(
          `Max executions (${MAX_NODE_EXECUTIONS}) exceeded for node "${(node.data as any).name || node.id}"`
        )
      }

      // Get outgoing edges from current node
      const outgoingEdges = workflow.edges.filter(
        (e) => e.source === currentNodeId
      )

      // Execute the node
      const executor = getExecutor(node.type as NodeType)
      const nodeStartTime = Date.now()

      try {
        // All executors receive the same parameters and return the same structure
        const executorResult = await executor({
          data: node.data as Record<string, unknown>,
          context,
          nodeId: node.id,
          workflowId,
          signal,
          executionId,
          outgoingEdges,
        })

        // Update context and get next node from executor result
        context = executorResult.context
        currentNodeId = executorResult.nextNodeId

        // Log successful node execution
        await window.api.history.logNodeExecution({
          id: crypto.randomUUID(),
          execution_id: executionId,
          node_id: node.id,
          node_name: (node.data as any).name || node.type || 'unknown',
          node_type: node.type || 'unknown',
          status: 'success',
          started_at: nodeStartTime,
          finished_at: Date.now(),
          duration: Date.now() - nodeStartTime,
          context_snapshot: context,
        })
      } catch (error) {
        // Extract error code if it's an ExecutorError
        const errorCode =
          error instanceof ExecutorError
            ? error.code
            : IPCErrorCode.UNKNOWN_ERROR

        // Log failed node execution
        await window.api.history.logNodeExecution({
          id: crypto.randomUUID(),
          execution_id: executionId,
          node_id: node.id,
          node_name: (node.data as any).name || node.type || 'unknown',
          node_type: node.type || 'unknown',
          status: 'error',
          started_at: nodeStartTime,
          finished_at: Date.now(),
          duration: Date.now() - nodeStartTime,
          context_snapshot: context,
          error: error instanceof Error ? error.message : String(error),
          error_code: errorCode,
        })

        // Check if it was cancelled during execution
        if (signal?.aborted) {
          console.log('Workflow cancelled during node execution')

          await window.api.history.finishExecution({
            id: executionId,
            finished_at: Date.now(),
            duration: Date.now() - executionStartTime,
            status: 'cancelled',
            final_context: context,
          })

          executionFinished = true

          return {
            workflowId,
            context,
          }
        }

        // Finish execution as failed
        await window.api.history.finishExecution({
          id: executionId,
          finished_at: Date.now(),
          duration: Date.now() - executionStartTime,
          status: 'failed',
          final_context: context,
          error: error instanceof Error ? error.message : String(error),
        })

        executionFinished = true

        throw error
      }

      // Check again after executor completes
      if (signal?.aborted) {
        console.log('Workflow cancelled after node execution')

        await window.api.history.finishExecution({
          id: executionId,
          finished_at: Date.now(),
          duration: Date.now() - executionStartTime,
          status: 'cancelled',
          final_context: context,
        })

        executionFinished = true

        return {
          workflowId,
          context,
        }
      }
    }

    // Finish execution as successful
    await window.api.history.finishExecution({
      id: executionId,
      finished_at: Date.now(),
      duration: Date.now() - executionStartTime,
      status: 'success',
      final_context: context,
    })

    executionFinished = true

    return {
      workflowId,
      context,
    }
  } catch (error) {
    // Only finish execution if not already finished
    if (!executionFinished) {
      await window.api.history.finishExecution({
        id: executionId,
        finished_at: Date.now(),
        duration: Date.now() - executionStartTime,
        status: 'failed',
        final_context: context,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    throw error
  }
}
