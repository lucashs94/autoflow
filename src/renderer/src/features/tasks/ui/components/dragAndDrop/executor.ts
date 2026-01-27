import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { ExecutorError, IPCErrorCode, isSuccess } from '@shared/@types/ipc-response'
import { compileTemplate } from '@renderer/lib/handleBars'
import {
  formatSelectorForPuppeteer,
  SelectorType,
} from '@renderer/types/selectorTypes'

type ExecutorDataProps = {
  name?: string
  sourceSelector?: string
  sourceSelectorType?: SelectorType
  targetSelector?: string
  targetSelectorType?: SelectorType
  timeout?: number
  retryAttempts?: number
  retryDelaySeconds?: number
}

export const dragAndDropExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  signal,
  outgoingEdges,
}) => {
  // Check if already aborted before starting
  if (signal?.aborted) {
    throw new Error('Drag and drop cancelled')
  }

  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.sourceSelector) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'Source selector not found')
    }

    if (!data.targetSelector) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'Target selector not found')
    }

    // Resolve templates in selectors
    const resolvedSourceSelector = compileTemplate(data.sourceSelector)(context)
    const resolvedTargetSelector = compileTemplate(data.targetSelector)(context)

    // Format selectors for Puppeteer based on type
    const finalSourceSelector = formatSelectorForPuppeteer(
      resolvedSourceSelector,
      data.sourceSelectorType || SelectorType.CSS
    )

    const finalTargetSelector = formatSelectorForPuppeteer(
      resolvedTargetSelector,
      data.targetSelectorType || SelectorType.CSS
    )

    console.log('Drag and Drop - source:', finalSourceSelector, 'target:', finalTargetSelector)

    const maxAttempts = data.retryAttempts ?? 1
    const delayMs = (data.retryDelaySeconds ?? 2) * 1000
    let lastError: ExecutorError | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check if aborted before each attempt
      if (signal?.aborted) {
        throw new Error('Drag and drop cancelled')
      }

      const result = await window.api.executions.dragAndDrop(
        finalSourceSelector,
        finalTargetSelector,
        data.timeout
      )

      // Check if aborted after operation completes
      if (signal?.aborted) {
        throw new Error('Drag and drop cancelled')
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
        console.log(`Drag and drop failed, retrying (${attempt}/${maxAttempts})...`)
        // Cancellable delay
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delayMs)
          if (signal) {
            const onAbort = () => {
              clearTimeout(timeoutId)
              reject(new Error('Drag and drop cancelled'))
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
