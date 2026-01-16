import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { ExecutorError, IPCErrorCode, isSuccess } from '@shared/@types/ipc-response'
import { compileTemplate } from '@renderer/lib/handleBars'

type ExecutorDataProps = {
  name?: string
  url?: string
  retryAttempts?: number
  retryDelaySeconds?: number
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

      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'URL not found')
    }

    // Resolve template in URL
    const resolvedUrl = compileTemplate(data.url)(context)

    const maxAttempts = data.retryAttempts ?? 1
    const delayMs = (data.retryDelaySeconds ?? 2) * 1000
    let lastError: ExecutorError | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await window.api.executions.navigateUrl(resolvedUrl)

      if (isSuccess(result)) {
        publishStatus({
          nodeId,
          status: 'success',
        })
        lastError = null
        break
      }

      lastError = ExecutorError.fromIPCError(result.error)

      if (attempt < maxAttempts) {
        console.log(`Navigation failed, retrying (${attempt}/${maxAttempts})...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    if (lastError) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw lastError
    }

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
