import { InitialNode } from '@renderer/components/nodes/initialNode'
import { NodeType } from '@renderer/types/nodes'
import { NodeTypes } from '@xyflow/react'

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  // [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  // [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const satisfies NodeTypes

export type RegisteredNodeTypes = keyof typeof nodeComponents
