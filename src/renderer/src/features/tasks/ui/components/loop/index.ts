import { loopNodeExecutor } from './executor'
import { LoopNode } from './node'

export const loopTask = {
  node: LoopNode,
  executor: loopNodeExecutor,
}
