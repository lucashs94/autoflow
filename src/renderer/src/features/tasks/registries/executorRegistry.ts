import { TaskRegistry } from '@renderer/features/tasks/registries/taskRegistry'
import { NodeType } from '@renderer/types/nodes'
import { NodeExecutor } from '../types/types'

export const executorRegistry: Partial<Record<NodeType, NodeExecutor>> = {
  [NodeType.HTTP_REQUEST]: TaskRegistry.HTTP_REQUEST.executor,
  [NodeType.NAVIGATION]: TaskRegistry.NAVIGATION.executor,
  [NodeType.WAIT_FOR_ELEMENT]: TaskRegistry.WAIT_FOR_ELEMENT.executor,
  [NodeType.TYPE_TEXT]: TaskRegistry.TYPE_TEXT.executor,
  [NodeType.CLICK_ELEMENT]: TaskRegistry.CLICK_ELEMENT.executor,
  [NodeType.WAIT_TIME]: TaskRegistry.WAIT_TIME.executor,
  [NodeType.SET_VARIABLES]: TaskRegistry.SET_VARIABLES.executor,
}

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type]

  if (!executor) throw new Error(`Executor not found for ${type} node`)

  return executor
}
