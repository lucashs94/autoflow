import { httpRequestExecutor } from './executor'
import { HttpRequestNode } from './node'

export const httpRequestTask = {
  node: HttpRequestNode,
  executor: httpRequestExecutor,
}
