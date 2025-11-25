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

export const clickElementExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  try {
    const result = (async () => {
      // TODO: Execucao aqui

      return {
        ...context,
        // [data.name]: '',
      }
    })()

    publishStatus({
      nodeId,
      status: 'success',
    })

    return result
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
