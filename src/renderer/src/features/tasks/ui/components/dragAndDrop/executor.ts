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
  outgoingEdges,
}) => {
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
      const result = await window.api.executions.dragAndDrop(
        finalSourceSelector,
        finalTargetSelector,
        data.timeout
      )

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
