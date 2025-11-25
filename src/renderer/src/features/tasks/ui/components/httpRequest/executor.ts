import Handlebars from 'handlebars'
import ky, { Options as KyOptions } from 'ky'
import { publishStatus } from '../../../nodeStatusChannel'
import { NodeExecutor } from '../../../types'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

type HttpRequestData = {
  name?: string
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  context,
  data,
  nodeId,
}) => {
  publishStatus({
    nodeId,
    status: 'loading',
  })

  await new Promise((resolve) => setTimeout(resolve, 3_000))

  try {
    const fn = async () => {
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
    }

    publishStatus({
      nodeId,
      status: 'success',
    })

    const result = await fn()

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
