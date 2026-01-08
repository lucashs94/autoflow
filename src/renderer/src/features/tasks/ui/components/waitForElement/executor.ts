import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
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
}

export const waitForElementNodeExecutor: NodeExecutor<
  ExecutorDataProps
> = async ({ context, data, nodeId }) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    const result = await window.api.executions.waitForElement(
      data.selector!,
      data.shouldBe!,
      data.timeout! * 1000
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
