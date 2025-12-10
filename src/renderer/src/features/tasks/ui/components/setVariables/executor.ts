import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

type ExecutorDataProps = {
  name?: string
  variables?: string
}

export const setVariableNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    if (!data.variables) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`Variables not found`)
    }

    const variables = JSON.parse(data.variables)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      ...context,
      [data.name!]: variables,
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
