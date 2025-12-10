import { setVariableNodeExecutor } from './executor'
import { SetVariableNode } from './node'

export const setVariableTask = {
  node: SetVariableNode,
  executor: setVariableNodeExecutor,
}
