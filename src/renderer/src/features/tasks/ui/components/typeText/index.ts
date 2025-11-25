import { typeTextExecutor } from './executor'
import { TypeTextNode } from './node'

export const waitForElementTask = {
  node: TypeTextNode,
  executor: typeTextExecutor,
}
