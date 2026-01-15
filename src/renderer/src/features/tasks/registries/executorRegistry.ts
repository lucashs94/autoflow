import { NodeType } from '@renderer/types/nodes'
import { NodeExecutor } from '../types/types'
import { clickElementExecutor } from '../ui/components/clickElement/executor'
import { dragAndDropExecutor } from '../ui/components/dragAndDrop/executor'
import { elementExistsExecutor } from '../ui/components/elementExists/executor'
import { getTextExecutor } from '../ui/components/getText/executor'
import { httpRequestExecutor } from '../ui/components/httpRequest/executor'
import { loopNodeExecutor } from '../ui/components/loop/executor'
import { navigationExecutor } from '../ui/components/navigation/executor'
import { setVariableNodeExecutor } from '../ui/components/setVariables/executor'
import { typeTextExecutor } from '../ui/components/typeText/executor'
import { waitForElementNodeExecutor } from '../ui/components/waitForElement/executor'
import { waitTimeNodeExecutor } from '../ui/components/waitTime/executor'

const registry = new Map<NodeType, NodeExecutor>()

export function registerExecutor(type: NodeType, executor: NodeExecutor) {
  registry.set(type, executor)
}

export function getExecutor(type: NodeType): NodeExecutor {
  const executor = registry.get(type)

  if (!executor) {
    throw new Error(`Executor not registered for ${type}`)
  }
  return executor
}

export function registerAllExecutors() {
  registerExecutor(NodeType.HTTP_REQUEST, httpRequestExecutor)
  registerExecutor(NodeType.NAVIGATION, navigationExecutor)
  registerExecutor(NodeType.WAIT_FOR_ELEMENT, waitForElementNodeExecutor)
  registerExecutor(NodeType.TYPE_TEXT, typeTextExecutor)
  registerExecutor(NodeType.WAIT_TIME, waitTimeNodeExecutor)
  registerExecutor(NodeType.SET_VARIABLES, setVariableNodeExecutor)
  registerExecutor(NodeType.CLICK_ELEMENT, clickElementExecutor)
  registerExecutor(NodeType.LOOP, loopNodeExecutor)
  registerExecutor(NodeType.GET_TEXT, getTextExecutor)
  registerExecutor(NodeType.ELEMENT_EXISTS, elementExistsExecutor)
  registerExecutor(NodeType.DRAG_AND_DROP, dragAndDropExecutor)
}
