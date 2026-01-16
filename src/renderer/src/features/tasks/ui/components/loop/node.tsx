import { BaseExecutionNodeWithHandles } from '@renderer/components/nodes/baseExecutionNodeWithHandles'
import { Badge } from '@renderer/components/ui/badge'
import { useNodeStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import {
  NodeToolbar,
  Position,
  useReactFlow,
  useStore,
  type Node,
  type NodeProps as xyflowNodeProps,
} from '@xyflow/react'
import { RepeatIcon } from 'lucide-react'
import { memo, useState } from 'react'
import { FormValues, SettingsDialog } from './dialog'

type NodeProps = {
  name: string
  variableList?: string
}

type NodeType = Node<NodeProps>

export const LoopNode = memo(
  (props: xyflowNodeProps<NodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()

    const { status: nodeStatus, progress } = useNodeStatus({
      nodeId: props.id,
    })

    const handleOpenSettings = () => {
      setDialogOpen(true)
    }

    const handleSubmit = (values: FormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            }
          }

          return node
        })
      )
    }

    const nodeData = props.data
    const zoom = useStore((s) => s.transform[2])
    const description = nodeData?.variableList
      ? `${nodeData.variableList}`
      : 'Not configured'

    return (
      <>
        <SettingsDialog
          nodeId={props.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        {progress && (
          <NodeToolbar
            position={Position.Top}
            isVisible
            className="flex justify-center"
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'bottom center',
              }}
            >
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-[10px] px-2 py-0"
              >
                {progress.current}/{progress.total}
              </Badge>
            </div>
          </NodeToolbar>
        )}

        <BaseExecutionNodeWithHandles
          {...props}
          id={props.id}
          icon={RepeatIcon}
          name={props.data.name}
          description={description}
          status={nodeStatus}
          handles={[
            {
              id: 'done',
              type: 'source',
              label: 'done',
            },
            {
              id: 'loop',
              type: 'source',
              label: 'loop',
            },
          ]}
          onSettings={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    )
  },
  (prev, next) => {
    return (
      prev.data === next.data &&
      prev.selected === next.selected &&
      prev.dragging === next.dragging
    )
  }
)
