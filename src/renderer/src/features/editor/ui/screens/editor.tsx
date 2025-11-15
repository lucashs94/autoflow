import { ErrorView } from '@renderer/components/errorView'
import { LoadingView } from '@renderer/components/loadingView'
import { Button } from '@renderer/components/ui/button'
import { nodeComponents } from '@renderer/config/nodeComponents'
import { useWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { editorAtom } from '@renderer/store/atom'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSetAtom } from 'jotai'
import { MoreHorizontalIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { AddNodeBtn } from '../components/addNodeBtn'
import { EditorHeaderName } from '../components/editorHeaderName'
import { ExecuteWorkflowBtn } from '../components/executeWorkflowBtn'
import { SaveWorkflowBtn } from '../components/saveWorkflowBtn copy'

export function Editor({ workflowId }: { workflowId: string }) {
  const setEditorInstance = useSetAtom(editorAtom)

  const { data: workflow } = useWorkflow(workflowId)

  const [nodes, setNodes] = useState<Node[]>(workflow?.nodes || [])
  const [edges, setEdges] = useState<Edge[]>(workflow?.edges || [])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  )
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  )

  return (
    <div className="size-full bg-muted">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeComponents}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setEditorInstance}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
        snapToGrid
        snapGrid={[10, 10]}
      >
        <Background />
        <Controls />

        <Panel position="top-left">
          {workflow ? <EditorHeaderName workflowId={workflow.id} /> : null}
        </Panel>

        <Panel
          position="top-right"
          className="flex flex-col items-end gap-4"
        >
          <div className="flex gap-2">
            <ExecuteWorkflowBtn workflowId={workflowId} />
            <SaveWorkflowBtn workflowId={workflowId} />

            <Button size="icon-lg">
              <MoreHorizontalIcon className="size-5" />
            </Button>
          </div>

          <div>
            <AddNodeBtn />
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor..." />
}
