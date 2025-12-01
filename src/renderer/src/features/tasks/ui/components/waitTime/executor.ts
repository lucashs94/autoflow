import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

type ExecutorDataProps = {
  name?: string
  time?: number
}

export const waitTimeNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!Number(data.time)) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`timeInSeconds is required`)
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Number(data.time) * 1_000)
    )

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      ...context,
      // [data.name]: '',
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
