import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { filtersToSelector } from '@renderer/features/tasks/utils/filterToSelector'
import { isSuccess } from '@shared/@types/ipc-response'
import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

type ExecutorDataProps = {
  name?: string
  selector?: string
  shouldBe?: 'visible' | 'hidden'
  timeout?: number
  filters?: ElementFilter[]
}

export const waitForElementNodeExecutor: NodeExecutor<
  ExecutorDataProps
> = async ({ context, data, nodeId }) => {
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

    // Apply filters to selector if provided
    const finalSelector =
      data.filters && data.filters.length > 0
        ? filtersToSelector(data.selector, data.filters)
        : data.selector

    console.log('Final selector with filters:', finalSelector)

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
      ...context,
      [data.name!]: true,
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
