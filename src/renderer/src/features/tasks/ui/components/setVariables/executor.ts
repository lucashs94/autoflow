import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { NodeExecutor } from '@renderer/features/tasks/types/types'
import { compileTemplate } from '@renderer/lib/handleBars'
import { verifyMinimunNodeExecutionTime } from '@renderer/utils/minNodeExecutionTime'

type ExecutorDataProps = {
  name?: string
  variables?: string
}

export const setVariableNodeExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
}) => {
  const start = performance.now()

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

    // const variables = JSON.parse(data.variables)
    const variables = compileTemplate(data.variables!)(context)
    const parsedVariables = JSON.parse(variables)

    await verifyMinimunNodeExecutionTime(start)

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      ...context,
      [data.name!]: parsedVariables,
    }
  } catch (error) {
    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
