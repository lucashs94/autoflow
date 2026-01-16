import { BaseExecutionNode } from '@renderer/components/nodes/baseExecutionNode'
import { useNodeStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { SelectorType } from '@renderer/types/selectorTypes'
import {
  useReactFlow,
  type Node,
  type NodeProps as xyflowNodeProps,
} from '@xyflow/react'
import { MousePointerIcon } from 'lucide-react'
import { memo, useState } from 'react'
import { FormValues, SettingsDialog } from './dialog'

type NodeProps = {
  name: string
  selector?: string
  selectorType?: SelectorType
  timeout?: number
  filters?: ElementFilter[]
  retryAttempts?: number
  retryDelaySeconds?: number
}

type NodeType = Node<NodeProps>

export const ClickElementNode = memo(
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
    const description = nodeData?.selector
      ? `${nodeData.selector}`
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

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={MousePointerIcon}
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
