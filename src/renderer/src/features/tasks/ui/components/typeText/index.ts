import { typeTextExecutor } from './executor'
import { TypeTextNode } from './node'

export const typeTextTask = {
  node: TypeTextNode,
  executor: typeTextExecutor,
}
