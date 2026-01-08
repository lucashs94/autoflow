import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { getExecutor } from '@renderer/features/tasks/registries/executorRegistry'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { topologicalSort } from '@renderer/features/workflows/utils/topologicalSort'
import { compileTemplate } from '@renderer/lib/handleBars'
import { NodeType } from '@renderer/types/nodes'
import { verifyMinimunNodeExecutionTime } from '@renderer/utils/minNodeExecutionTime'
import { isSuccess } from '@shared/@types/ipc-response'

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
      throw new Error(`variable is required`)
    }

    const workflowResult = await window.api.workflows.getOne(workflowId)

    if (!isSuccess(workflowResult)) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new Error(workflowResult.error.message)
    }

    const workflow = workflowResult.data

    const rootNode = workflow.nodes.find((n) => n.id === nodeId)
    if (!rootNode) {
      throw new Error(`Workflow must have an initial node!`)
    }

    const compiledTemplate = compileTemplate(data.variableList!)(context)
    const vars = JSON.parse(compiledTemplate)

    //Verifica se variavel indicada é uma lista
    if (!Array.isArray(vars)) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`variable must be an array`)
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

      throw new Error(`loop must have a connected final node`)
    }

    // Executar a sequencia de nodes passando o item como contexto
    for (const item of vars) {
      // Check if workflow was cancelled before processing this iteration
      if (signal?.aborted) {
        console.log('Loop cancelled - stopping iterations')
        throw new Error('Loop execution cancelled')
      }

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

        internalContext = await executor({
          data: node.data as Record<string, unknown>,
          context: internalContext,
          nodeId: node.id,
          workflowId,
          signal, // Pass signal to nested executors
        })
      }

      const { [data.name!]: _, ...rest } = internalContext
      context = {
        ...context,
        ...rest,
      }
    }

    console.log('after', JSON.stringify(context, null, 2))

    await verifyMinimunNodeExecutionTime(start)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      ...context,
      [data.name!]: '',
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
