import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { filtersToSelector } from '@renderer/features/tasks/utils/filterToSelector'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { compileTemplate } from '@renderer/lib/handleBars'
import {
  formatSelectorForPuppeteer,
  SelectorType,
} from '@renderer/types/selectorTypes'
import { ExecutorError, IPCErrorCode } from '@shared/@types/ipc-response'

type ExecutorDataProps = {
  name?: string
  selector?: string
  selectorType?: SelectorType
  timeout?: number
  filters?: ElementFilter[]
  retryAttempts?: number
  retryDelaySeconds?: number
}

export const elementExistsExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  signal,
  outgoingEdges,
}) => {
  // Check if already aborted before starting
  if (signal?.aborted) {
    throw new Error('Element exists check cancelled')
  }

  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.selector) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'Selector not found')
    }

    // Resolve template in selector
    const resolvedSelector = compileTemplate(data.selector)(context)

    // Validate: filters only work with CSS selectors
    if (
      data.selectorType === SelectorType.XPATH &&
      data.filters &&
      data.filters.length > 0
    ) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new ExecutorError(
        IPCErrorCode.VALIDATION_ERROR,
        'Advanced filters are not compatible with XPath selectors. Please use CSS selector type or remove filters.'
      )
    }

    // Apply filters to selector if provided (only for CSS)
    let finalSelector =
      data.filters && data.filters.length > 0
        ? filtersToSelector(resolvedSelector, data.filters)
        : resolvedSelector

    // Format selector for Puppeteer based on type
    finalSelector = formatSelectorForPuppeteer(
      finalSelector,
      data.selectorType || SelectorType.CSS
    )

    console.log('Element exists check - selector:', finalSelector)

    const maxAttempts = data.retryAttempts ?? 1
    const delayMs = (data.retryDelaySeconds ?? 2) * 1000
    let exists = false
    let apiCallSucceeded = false

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Check if aborted before each attempt
      if (signal?.aborted) {
        throw new Error('Element exists check cancelled')
      }

      // Call the elementExists API - this returns boolean, not throws
      const result = await window.api.executions.elementExists(
        finalSelector,
        data.timeout
      )

      // Check if aborted after operation completes
      if (signal?.aborted) {
        throw new Error('Element exists check cancelled')
      }

      if (result.success) {
        exists = result.data?.exists === true
        apiCallSucceeded = true
        break
      }

      if (attempt < maxAttempts) {
        console.log(`Element exists check failed, retrying (${attempt}/${maxAttempts})...`)
        // Cancellable delay
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delayMs)
          if (signal) {
            const onAbort = () => {
              clearTimeout(timeoutId)
              reject(new Error('Element exists check cancelled'))
            }
            signal.addEventListener('abort', onAbort, { once: true })
          }
        })
      }
    }

    if (!apiCallSucceeded) {
      publishStatus({
        nodeId,
        status: 'error',
      })
      throw new ExecutorError(IPCErrorCode.UNKNOWN_ERROR, 'Failed to check if element exists')
    }

    console.log('Element exists result:', exists)

    publishStatus({
      nodeId,
      status: 'success',
    })

    // Return context with exists result and branch to follow
    return {
      context: {
        ...context,
        [data.name!]: {
          exists,
        },
      },
      // Follow 'true' handle if exists, 'false' handle if not
      nextNodeId: findNextNode(outgoingEdges, exists ? 'true' : 'false'),
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
