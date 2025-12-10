import { InitialNode } from '@renderer/components/nodes/initialNode'
import { TaskRegistry } from '@renderer/features/tasks/registries/taskRegistry'
import { NodeType } from '@renderer/types/nodes'
import { NodeTypes } from '@xyflow/react'

type nodeComponentsTypes = {
  [K in NodeType]: NodeTypes[string]
}

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: TaskRegistry.HTTP_REQUEST.node,
  [NodeType.NAVIGATION]: TaskRegistry.NAVIGATION.node,
  [NodeType.WAIT_FOR_ELEMENT]: TaskRegistry.WAIT_FOR_ELEMENT.node,
  [NodeType.TYPE_TEXT]: TaskRegistry.TYPE_TEXT.node,
  [NodeType.CLICK_ELEMENT]: TaskRegistry.CLICK_ELEMENT.node,
  [NodeType.WAIT_TIME]: TaskRegistry.WAIT_TIME.node,
  [NodeType.SET_VARIABLES]: TaskRegistry.SET_VARIABLES.node,
} as const satisfies nodeComponentsTypes

export type RegisteredNodeTypes = keyof typeof nodeComponents
