import Handlebars from 'handlebars'
import ky, { Options as KyOptions } from 'ky'
import { publishStatus } from '../../../channels/nodeStatusChannel'
import { NodeExecutor } from '../../../types/types'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

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
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  // TODO: Remove this wait simulate point
  await new Promise((resolve) => setTimeout(resolve, 1_000))

  try {
    const result = (async () => {
      if (!data.endpoint || !data.name || !data.method) {
        publishStatus({
          nodeId,
          status: 'error',
        })

        throw new Error(`HTTP Request node: No all infos configured`)
      }

      const method = data.method
      const endpoint = data.endpoint

      const options: KyOptions = { method }

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (data.body) {
          const resolved = data.body || '{}'
          JSON.parse(resolved)

          options.body = resolved
          options.headers = {
            'Content-Type': 'application/json',
          }
        }
      }

      const response = await ky(endpoint, options)
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

      return {
        ...context,
        [data.name]: responsePayload,
      }
    })()

    publishStatus({
      nodeId,
      status: 'success',
    })

    return result
  } catch (error) {
    console.log(error)

    publishStatus({
      nodeId,
      status: 'error',
    })

    throw error
  }
}
