import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { getExecutor } from '@renderer/features/tasks/registries/executorRegistry'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { topologicalSort } from '@renderer/features/workflows/utils/topologicalSort'
import { compileTemplate } from '@renderer/lib/handleBars'
import { NodeType } from '@renderer/types/nodes'
import { verifyMinimunNodeExecutionTime } from '@renderer/utils/minNodeExecutionTime'
import { ExecutorError, IPCErrorCode, isSuccess } from '@shared/@types/ipc-response'

type ExecutorDataProps = {
  name?: string
  variableList?: string
}

export const loopNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  workflowId,
  signal,
  executionId,
  outgoingEdges,
}) => {
  const start = performance.now()

  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.variableList) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'variable is required')
    }

    const workflowResult = await window.api.workflows.getOne(workflowId)

    if (!isSuccess(workflowResult)) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw ExecutorError.fromIPCError(workflowResult.error)
    }

    const workflow = workflowResult.data

    const rootNode = workflow.nodes.find((n) => n.id === nodeId)
    if (!rootNode) {
      throw new ExecutorError(IPCErrorCode.NODE_NOT_FOUND, 'Workflow must have an initial node!')
    }

    const compiledTemplate = compileTemplate(data.variableList!)(context)
    const vars = JSON.parse(compiledTemplate)

    //Verifica se variavel indicada é uma lista
    if (!Array.isArray(vars)) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'variable must be an array')
    }

    const nextNodes = topologicalSort(workflow.nodes, workflow.edges, rootNode)
    console.log('nextNodes', nextNodes)

    // Verificar se existe um node dentre os nextNodes que tenha uma edge saindo dele e chegando no node loop
    const hasLoopFinalEdge = workflow.edges.some(
      (edge) =>
        edge.target === nodeId && nextNodes.some((n) => n.id === edge.source)
    )

    if (!hasLoopFinalEdge) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new ExecutorError(IPCErrorCode.INVALID_WORKFLOW, 'loop must have a connected final node')
    }

    // Track results from each iteration for context preservation
    const iterationResults: unknown[] = []
    let currentIndex = 0

    // Executar a sequencia de nodes passando o item como contexto
    for (const item of vars) {
      // Check if workflow was cancelled before processing this iteration
      if (signal?.aborted) {
        console.log('Loop cancelled - stopping iterations')
        throw new Error('Loop execution cancelled')
      }

      // Publish loop progress
      publishStatus({
        nodeId,
        status: 'loading',
        progress: {
          current: currentIndex + 1,
          total: vars.length,
        },
      })

      nextNodes.forEach((node) => {
        if (node.type !== NodeType.LOOP) {
          publishStatus({
            nodeId: node.id,
            status: 'initial',
          })
        }
      })

      let internalContext: Record<string, unknown> = {
        ...context,
        [data.name!]: {
          item,
          index: currentIndex,
          total: vars.length,
        },
      }

      for (const node of nextNodes) {
        // Check if cancelled before each node in the loop
        if (signal?.aborted) {
          console.log('Loop cancelled during node execution')

          // Reset internal nodes to initial state
          nextNodes.forEach((n) => {
            if (n.type !== NodeType.LOOP) {
              publishStatus({
                nodeId: n.id,
                status: 'initial',
              })
            }
          })

          throw new Error('Loop execution cancelled')
        }

        if (node.type === NodeType.LOOP && node.id === nodeId) continue

        const executor = getExecutor(node.type as NodeType)
        const nodeStartTime = Date.now()

        // Get outgoing edges for this internal node
        const nodeOutgoingEdges = workflow.edges.filter(
          (e) => e.source === node.id
        )

        try {
          const result = await executor({
            data: node.data as Record<string, unknown>,
            context: internalContext,
            nodeId: node.id,
            workflowId,
            signal,
            executionId,
            outgoingEdges: nodeOutgoingEdges,
          })

          // Extract context from result
          internalContext = result.context

          // Log successful node execution inside loop
          if (executionId) {
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
              context_snapshot: internalContext,
            })
          }
        } catch (error) {
          // Extract error code if it's an ExecutorError
          const errorCode =
            error instanceof ExecutorError
              ? error.code
              : IPCErrorCode.UNKNOWN_ERROR

          // Log failed node execution inside loop
          if (executionId) {
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
              context_snapshot: internalContext,
              error: error instanceof Error ? error.message : String(error),
              error_code: errorCode,
            })
          }

          throw error
        }
      }

      // Store the iteration result (the loop variable data)
      const loopVarData = internalContext[data.name!]
      iterationResults.push(loopVarData)

      // Merge internal context back, preserving all data from internal nodes
      const { [data.name!]: _, ...rest } = internalContext
      context = {
        ...context,
        ...rest,
      }

      currentIndex++
    }

    console.log('after', JSON.stringify(context, null, 2))

    await verifyMinimunNodeExecutionTime(start)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      context: {
        ...context,
        [data.name!]: {
          completed: true,
          iterations: vars.length,
          results: iterationResults,
        },
      },
      nextNodeId: findNextNode(outgoingEdges, 'done'),
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
