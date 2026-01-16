import { BaseExecutionNodeWithHandles } from '@renderer/components/nodes/baseExecutionNodeWithHandles'
import { useNodeStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { SelectorType } from '@renderer/types/selectorTypes'
import {
  useReactFlow,
  type Node,
  type NodeProps as xyflowNodeProps,
} from '@xyflow/react'
import { SearchCheckIcon } from 'lucide-react'
import { memo, useState } from 'react'
import { FormValues, SettingsDialog } from './dialog'

type NodeProps = {
  name: string
  selector?: string
  selectorType?: SelectorType
  timeout?: number
}

type NodeType = Node<NodeProps>

export const ElementExistsNode = memo(
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

        <BaseExecutionNodeWithHandles
          {...props}
          id={props.id}
          icon={SearchCheckIcon}
          name={props.data.name}
          description={description}
          status={nodeStatus}
          handles={[
            {
              id: 'true',
              type: 'source',
              label: 'true',
            },
            {
              id: 'false',
              type: 'source',
              label: 'false',
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
