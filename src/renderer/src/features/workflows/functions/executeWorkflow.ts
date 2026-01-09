import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import {
  getExecutor,
  registerAllExecutors,
} from '@renderer/features/tasks/registries/executorRegistry'
import { NodeType } from '@renderer/types/nodes'
import { isSuccess } from '@shared/@types/ipc-response'
import { topologicalSort } from '../utils/topologicalSort'

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

  const initialNode = workflow.nodes.find((n) => n.type === NodeType.INITIAL)
  if (!initialNode) {
    throw new Error(`Workflow must have an initial node!`)
  }

  ;(async () => {
    workflow.nodes.forEach((node) => {
      publishStatus({
        nodeId: node.id,
        status: 'initial',
      })
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })()

  registerAllExecutors()

  // TODO: Add Types

  // Define topological order
  const sorted = topologicalSort(workflow.nodes, workflow.edges, initialNode)

  console.log(sorted)

  // Initialize the Context
  let context = {}

  // IPC start flow

  let executionFinished = false

  try {
    // Loop on each node and run the executor
    for (const node of sorted) {
      // Check if workflow was cancelled
      if (signal?.aborted) {
        console.log('Workflow cancelled - resetting remaining nodes')

        // Finish execution as cancelled
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

      if (node.type === NodeType.INITIAL) continue

      const executor = getExecutor(node.type as NodeType)
      const nodeStartTime = Date.now()

      try {
        context = await executor({
          data: node.data as Record<string, unknown>,
          context,
          nodeId: node.id,
          workflowId,
          signal,
        })

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
        })

        // Check if it was cancelled during execution
        if (signal?.aborted) {
          console.log(
            'Workflow cancelled during node execution - resetting remaining nodes'
          )

          // Reset all remaining nodes
          const currentIndex = sorted.indexOf(node)
          sorted.slice(currentIndex + 1).forEach((remainingNode) => {
            if (remainingNode.type !== NodeType.INITIAL) {
              publishStatus({
                nodeId: remainingNode.id,
                status: 'initial',
              })
            }
          })

          // Finish execution as cancelled
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

        // Re-throw other errors
        throw error
      }

      // Check again after executor completes in case it was cancelled during execution
      if (signal?.aborted) {
        console.log(
          'Workflow cancelled after node execution - resetting remaining nodes'
        )

        // Reset all remaining nodes
        const currentIndex = sorted.indexOf(node)
        sorted.slice(currentIndex + 1).forEach((remainingNode) => {
          if (remainingNode.type !== NodeType.INITIAL) {
            publishStatus({
              nodeId: remainingNode.id,
              status: 'initial',
            })
          }
        })

        // Finish execution as cancelled
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
