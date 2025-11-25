import { waitForElementNodeExecutor } from './executor'
import { WaitForElementNode } from './node'

export const waitForElementTask = {
  node: WaitForElementNode,
  executor: waitForElementNodeExecutor,
}
