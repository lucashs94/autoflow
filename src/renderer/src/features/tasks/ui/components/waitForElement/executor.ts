import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { filtersToSelector } from '@renderer/features/tasks/utils/filterToSelector'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { ExecutorError, IPCErrorCode, isSuccess } from '@shared/@types/ipc-response'
import { compileTemplate } from '@renderer/lib/handleBars'
import {
  formatSelectorForPuppeteer,
  SelectorType,
} from '@renderer/types/selectorTypes'

type ExecutorDataProps = {
  name?: string
  selector?: string
  selectorType?: SelectorType
  shouldBe?: 'visible' | 'hidden'
  timeout?: number
  filters?: ElementFilter[]
  retryAttempts?: number
  retryDelaySeconds?: number
}

export const waitForElementNodeExecutor: NodeExecutor<
  ExecutorDataProps
> = async ({ context, data, nodeId, outgoingEdges }) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.selector || !data.shouldBe) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new ExecutorError(IPCErrorCode.VALIDATION_ERROR, 'Selector or visibility state not found')
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

    console.log('Final selector:', finalSelector)

    const maxAttempts = data.retryAttempts ?? 1
    const delayMs = (data.retryDelaySeconds ?? 2) * 1000
    let lastError: ExecutorError | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await window.api.executions.waitForElement(
        finalSelector,
        data.shouldBe,
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
        console.log(`Wait for element failed, retrying (${attempt}/${maxAttempts})...`)
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
        [data.name!]: true,
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
