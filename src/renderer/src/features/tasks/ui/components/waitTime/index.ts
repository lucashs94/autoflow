import { waitTimeNodeExecutor } from './executor'
import { WaitTimeNode } from './node'

export const waitTimeTask = {
  node: WaitTimeNode,
  executor: waitTimeNodeExecutor,
}
