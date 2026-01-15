import ky, { Options as KyOptions } from 'ky'
import { publishStatus } from '../../../channels/nodeStatusChannel'
import { NodeExecutor } from '../../../types/types'
import { findNextNode } from '@renderer/features/workflows/utils/findNextNode'
import { compileTemplate } from '@renderer/lib/handleBars'

type ExecutorDataProps = {
  name?: string
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: string
}

export const httpRequestExecutor: NodeExecutor<ExecutorDataProps> = async ({
  context,
  data,
  nodeId,
  signal,
  outgoingEdges,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  // TODO: Remove this wait simulate point
  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, 1_000)
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new Error('HTTP request cancelled'))
      })
    }
  })

  try {
    if (!data.endpoint || !data.name || !data.method) {
      publishStatus({
        nodeId,
        status: 'error',
      })

      throw new Error(`HTTP Request node: No all infos configured`)
    }

    const method = data.method

    // Resolve templates in endpoint and body
    const resolvedEndpoint = compileTemplate(data.endpoint)(context)

    const options: KyOptions = {
      method,
      signal, // Pass abort signal to ky
    }

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (data.body) {
        const resolvedBody = compileTemplate(data.body)(context)
        JSON.parse(resolvedBody)

        options.body = resolvedBody
        options.headers = {
          'Content-Type': 'application/json',
        }
      }
    }

    const response = await ky(resolvedEndpoint, options)
    const contentType = response.headers.get('content-type')
    const responseData = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    }

    publishStatus({
      nodeId,
      status: 'success',
    })

    return {
      context: {
        ...context,
        [data.name]: responsePayload,
      },
      nextNodeId: findNextNode(outgoingEdges),
    }
  } catch (error) {
    console.log(error)

    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
