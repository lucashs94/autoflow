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
  handles?: {
    id: string
    type: 'source' | 'target'
    label?: string
  }[]
  onSettings?: () => void
  onDoubleClick?: () => void
}

export const BaseExecutionNodeWithHandles = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    status = 'initial',
    children,
    handles = [],
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

              {handles.map((h, i) => (
                <BaseHandle
                  key={h.id}
                  id={h.id}
                  type={h.type}
                  position={Position.Right}
                  style={{
                    position: 'absolute',
                    top: `${((i + 1) / (handles.length + 1)) * 100}%`,
                    right: '-10%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '8px',
                  }}
                >
                  {h.label && (
                    <span className="text-[8px] ml-2 bg-muted/50">
                      {h.label}
                    </span>
                  )}
                </BaseHandle>
              ))}
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    )
  }
)

BaseExecutionNodeWithHandles.displayName = 'BaseExecutionNodeWithHandles'
