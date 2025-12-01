import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

type ExecutorDataProps = {
  name?: string
  selector?: string
  text?: string
}

export const typeTextExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.selector || !data.text) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`Selector or text not found`)
    }

    await window.api.executions.typeText(data.selector, data.text)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      ...context,
      [data.name!]: 'true',
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
