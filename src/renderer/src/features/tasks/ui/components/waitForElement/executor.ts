import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { filtersToSelector } from '@renderer/features/tasks/utils/filterToSelector'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { isSuccess } from '@shared/@types/ipc-response'
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

      throw new Error(`Selector or visibility state not found`)
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
      throw new Error(
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

    const result = await window.api.executions.waitForElement(
      finalSelector,
      data.shouldBe,
      data.timeout
    )

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
