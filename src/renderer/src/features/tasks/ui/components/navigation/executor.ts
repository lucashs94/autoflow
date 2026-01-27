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
  signal,
  outgoingEdges,
}) => {
  // Check if already aborted before starting
  if (signal?.aborted) {
    throw new Error('Navigation cancelled')
  }

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

    // Get headless setting from context (set by executeWorkflow)
    const headless = context.__headless as boolean | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check if aborted before each attempt
      if (signal?.aborted) {
        throw new Error('Navigation cancelled')
      }

      const result = await window.api.executions.navigateUrl(resolvedUrl, headless)

      // Check if aborted after navigation completes
      if (signal?.aborted) {
        throw new Error('Navigation cancelled')
      }

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
        // Cancellable delay
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delayMs)
          if (signal) {
            const onAbort = () => {
              clearTimeout(timeoutId)
              reject(new Error('Navigation cancelled'))
            }
            signal.addEventListener('abort', onAbort, { once: true })
          }
        })
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
