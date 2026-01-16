import { BaseExecutionNode } from '@renderer/components/nodes/baseExecutionNode'
import { useNodeStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import {
  useReactFlow,
  type Node,
  type NodeProps as xyflowNodeProps,
} from '@xyflow/react'
import { ChromiumIcon } from 'lucide-react'
import { memo, useState } from 'react'
import { FormValues, SettingsDialog } from './dialog'

type NodeProps = {
  name: string
  url?: string
}

type NodeType = Node<NodeProps>

export const NavigationNode = memo(
  (props: xyflowNodeProps<NodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()

    const { status: nodeStatus } = useNodeStatus({
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
    const description = nodeData?.url ? `${nodeData.url}` : 'Not configured'

    return (
      <>
        <SettingsDialog
          nodeId={props.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={ChromiumIcon}
          name={props.data.name}
          description={description}
          status={nodeStatus}
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
