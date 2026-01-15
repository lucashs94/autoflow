import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { isSuccess } from '@shared/@types/ipc-response'
import { compileTemplate } from '@renderer/lib/handleBars'

type ExecutorDataProps = {
  name?: string
  url?: string
}

export const navigationExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  outgoingEdges,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.url) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`URL not found`)
    }

    // Resolve template in URL
    const resolvedUrl = compileTemplate(data.url)(context)

    const result = await window.api.executions.navigateUrl(resolvedUrl)

    if (!isSuccess(result)) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new Error(result.error.message)
    }

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      context: {
        ...context,
        [data.name!]: 'true',
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
