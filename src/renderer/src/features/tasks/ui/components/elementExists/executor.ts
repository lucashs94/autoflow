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

type ExecutorDataProps = {
  name?: string
  selector?: string
  selectorType?: SelectorType
  timeout?: number
  filters?: ElementFilter[]
}

export const elementExistsExecutor: NodeExecutor<ExecutorDataProps> = async ({
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
    if (!data.selector) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`Selector not found`)
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

    console.log('Element exists check - selector:', finalSelector)

    // Call the elementExists API - this returns boolean, not throws
    const result = await window.api.executions.elementExists(
      finalSelector,
      data.timeout
    )

    const exists = result.success && result.data?.exists === true

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
