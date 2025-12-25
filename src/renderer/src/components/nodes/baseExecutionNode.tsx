import { WorkflowNode } from '@renderer/components/nodes/workflowNode'
import { BaseHandle } from '@renderer/components/reactFlow/base-handle'
import {
  BaseNode,
  BaseNodeContent,
} from '@renderer/components/reactFlow/base-node'
import {
  NodeStatus,
  NodeStatusIndicator,
} from '@renderer/components/reactFlow/node-status-indicator'
import { NodeProps, Position, useReactFlow } from '@xyflow/react'
import { LucideIcon } from 'lucide-react'
import { memo } from 'react'

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string
  name: string
  description?: string
  children?: React.ReactNode
  status?: NodeStatus
  onSettings?: () => void
  onDoubleClick?: () => void
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    status = 'initial',
    children,
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { setNodes, setEdges } = useReactFlow()

    const handleDelete = () => {
      setNodes((nodes) => {
        const updatedNodes = nodes.filter((node) => node.id !== id)
        return updatedNodes
      })

      setEdges((edges) => {
        const updatedEdges = edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        )
        return updatedEdges
      })
    }

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
        >
          <BaseNode
            onDoubleClick={onDoubleClick}
            status={status}
          >
            <BaseNodeContent>
              {typeof Icon === 'string' ? (
                <img
                  src={Icon}
                  alt={name}
                  width={16}
                  height={16}
                />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}

              {children}

              <BaseHandle
                id={`target-1`}
                type="target"
                position={Position.Left}
              />

              <BaseHandle
                id={`source-1`}
                type="source"
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  }
)

BaseExecutionNode.displayName = 'BaseExecutionNode'
