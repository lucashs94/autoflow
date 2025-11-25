'use client'

import type { Node, NodeProps } from '@xyflow/react'
import { CirclePlayIcon } from 'lucide-react'
import { memo } from 'react'
import { BaseInitialNode } from './baseInitialNode'

type InitialNodeProps = {
  name: string
}

type InitialNodeType = Node<InitialNodeProps>

export const InitialNode = memo((props: NodeProps<InitialNodeType>) => {
  const nodeStatus = 'initial'

  return (
    <BaseInitialNode
      {...props}
      id={props.id}
      icon={CirclePlayIcon}
      name="Start"
      description={`when clicking 'Execute workflow'`}
      status={nodeStatus}
    />
  )
})

InitialNode.displayName = 'InitialNode'
