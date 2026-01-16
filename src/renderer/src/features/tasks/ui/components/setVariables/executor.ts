import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { compileTemplate } from '@renderer/lib/handleBars'
import { verifyMinimunNodeExecutionTime } from '@renderer/utils/minNodeExecutionTime'
import { ExecutorError, IPCErrorCode } from '@shared/@types/ipc-response'

type ExecutorDataProps = {
  name?: string
  variables?: string
}

export const setVariableNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  outgoingEdges,
}) => {
  const start = performance.now()

  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.variables) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'Variables not found')
    }

    // const variables = JSON.parse(data.variables)
    const variables = compileTemplate(data.variables!)(context)
    const parsedVariables = JSON.parse(variables)

    await verifyMinimunNodeExecutionTime(start)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      context: {
        ...context,
        [data.name!]: parsedVariables,
      },
      nextNodeId: findNextNode(outgoingEdges),
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
