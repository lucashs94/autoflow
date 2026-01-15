import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { compileTemplate } from '@renderer/lib/handleBars'

type ExecutorDataProps = {
  name?: string
  time?: number
}

export const waitTimeNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  signal,
  outgoingEdges,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.time) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`timeInSeconds is required`)
    }

    // Resolve template in time (can be a number or template string)
    const resolvedTime = compileTemplate(String(data.time))(context)
    const timeInSeconds = Number(resolvedTime)

    if (!timeInSeconds || isNaN(timeInSeconds)) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`timeInSeconds must be a valid number`)
    }

    // Make wait time cancellable
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, timeInSeconds * 1_000)

      // Listen for abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          reject(new Error('Wait time cancelled'))
        })
      }
    })

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      context: {
        ...context,
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
