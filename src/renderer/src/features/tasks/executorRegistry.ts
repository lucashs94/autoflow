import { TaskRegistry } from '@renderer/features/tasks/taskRegistry'
import { NodeType } from '@renderer/types/nodes'
import { NodeExecutor } from './types'

export const executorRegistry: Partial<Record<NodeType, NodeExecutor>> = {
  [NodeType.HTTP_REQUEST]: TaskRegistry.HTTP_REQUEST.executor,
}

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type]

  if (!executor) throw new Error(`Executor not found for ${type} node`)

  return executor
}
