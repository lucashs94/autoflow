'use client'

import { useReactFlow, type Node, type NodeProps } from '@xyflow/react'
import { GlobeIcon } from 'lucide-react'
import { memo, useState } from 'react'
// import { useNodeStatus } from '../../hooks/useNodeStatus'
import { BaseExecutionNode } from '@renderer/components/nodes/baseExecutionNode'
import { useNodeStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import { HttpRequestDialog, HttpRequestFormValues } from './dialog'

type HttpRequestNodeProps = {
  name: string
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: string
}

type HttpRequestNodeType = Node<HttpRequestNodeProps>

export const HttpRequestNode = memo(
  (props: NodeProps<HttpRequestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { setNodes } = useReactFlow()

    const nodeStatus = useNodeStatus({
      nodeId: props.id,
    })

    const handleOpenSettings = () => {
      setDialogOpen(true)
    }

    const handleSubmit = (values: HttpRequestFormValues) => {
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
    const description = nodeData?.endpoint
      ? `${nodeData.method || 'GET'}: ${nodeData.endpoint}`
      : 'Not configured'

    return (
      <>
        <HttpRequestDialog
          nodeId={props.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={nodeData}
        />

        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={GlobeIcon}
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
