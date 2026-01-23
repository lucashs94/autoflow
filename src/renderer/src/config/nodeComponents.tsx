import { InitialNode } from '@renderer/components/nodes/initialNode'
import { StickyNote } from '@renderer/components/nodes/stickyNote'
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
  [NodeType.LOOP]: TaskRegistry.LOOP.node,
  [NodeType.GET_TEXT]: TaskRegistry.GET_TEXT.node,
  [NodeType.ELEMENT_EXISTS]: TaskRegistry.ELEMENT_EXISTS.node,
  [NodeType.DRAG_AND_DROP]: TaskRegistry.DRAG_AND_DROP.node,
  [NodeType.STICKY_NOTE]: StickyNote,
} as const satisfies nodeComponentsTypes

export type RegisteredNodeTypes = keyof typeof nodeComponents
