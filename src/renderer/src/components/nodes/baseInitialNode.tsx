'use client'

import { BaseHandle } from '@renderer/components/reactFlow/base-handle'
import {
  BaseNode,
  BaseNodeContent,
} from '@renderer/components/reactFlow/base-node'
import {
  NodeStatus,
  NodeStatusIndicator,
} from '@renderer/components/reactFlow/node-status-indicator'
import { NodeProps, Position } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}

export const BaseInitialNode = memo(
  ({
    icon: Icon,
    name,
    description,
    status = 'initial',
    children,
  }: BaseTriggerNodeProps) => {
    return (
      <NodeStatusIndicator
        status={status}
        variant="border"
        className=""
      >
        <BaseNode
          status={status}
          className="relative group w-[100px] min-h-[30px] text-green-300 border-green-400/70 bg-green-950/40 hover:bg-green-950/20 backdrop-blur-sm"
        >
          <BaseNodeContent className="p-0">
            <div className="flex flex-col p-1 gap-1">
              <div className="flex gap-1 items-center">
                {typeof Icon === 'string' ? (
                  <img
                    src={Icon}
                    alt={name}
                    width={8}
                    height={8}
                  />
                ) : (
                  <Icon className="size-3" />
                )}

                <span className="text-[8px]">{name}</span>
              </div>

              <div className="flex flex-wrap text-[6px] line-clamp-2 text-muted-foreground">
                {description}
              </div>

              {children}
            </div>

            <BaseHandle
              id={`source-1`}
              type="source"
              position={Position.Right}
            />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    )
  }
)

BaseInitialNode.displayName = 'BaseInitialNode'
