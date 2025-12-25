import { ConnectionLineCustom } from '@renderer/components/edges/connectionLines'
import { DeletableEdge } from '@renderer/components/edges/deletableEdge'
import { ErrorView } from '@renderer/components/errorView'
import { LoadingView } from '@renderer/components/loadingView'
import { Button } from '@renderer/components/ui/button'
import { nodeComponents } from '@renderer/config/nodeComponents'
import { editorAtom } from '@renderer/features/editor/store/atom'
import { registerAllExecutors } from '@renderer/features/tasks/registries/executorRegistry'
import {
  useUpdateWorkflow,
  useWorkflow,
} from '@renderer/features/workflows/hooks/useWorkflows'
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
import { useCallback, useEffect, useState } from 'react'
import { getSnapshot, verifyHasChanges } from '../../utils/hasChanges'
import { AddNodeBtn } from '../components/addNodeBtn'
import { EditorHeaderName } from '../components/editorHeaderName'
import { ExecuteWorkflowBtn } from '../components/executeWorkflowBtn'
import { SaveWorkflowBtn } from '../components/saveWorkflowBtn'

const edgeTypes = {
  default: DeletableEdge,
}

export function Editor({ workflowId }: { workflowId: string }) {
  const setEditorInstance = useSetAtom(editorAtom)
  const saveWorkflow = useUpdateWorkflow()

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

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      // self connect
      if (connection.source === connection.target) return false

      const source = nodes.find((node) => node.id === connection.source)
      const target = nodes.find((node) => node.id === connection.target)

      if (!source || !target) return false

      // const hasCycle = (node: Node, visited = new Set()) => {
      //   if (visited.has(node.id)) return false
      //   visited.add(node.id)

      //   for (const outgoer of getOutgoers(node, nodes, edges)) {
      //     if (outgoer.id === connection.source) return true
      //     if (hasCycle(outgoer, visited)) return true
      //   }
      // }
      // const detectedCycle = hasCycle(target)

      // return !detectedCycle
      return true
    },
    [nodes, edges]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'

    if (!isSave) return

    e.preventDefault()
    e.stopPropagation()

    saveWorkflow.mutate({
      workflowId,
      nodes,
      edges,
    })
  }

  const snapshot = getSnapshot(workflow)
  const hasChanges = verifyHasChanges(nodes, edges, snapshot)

  useEffect(() => {
    registerAllExecutors()
  }, [])

  return (
    <div
      className="size-full bg-muted"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeComponents}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLineCustom}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onInit={setEditorInstance}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
        snapToGrid
        snapGrid={[10, 10]}
      >
        <Background />
        <Controls
          style={{
            color: 'green',
          }}
        />

        <Panel position="top-left">
          {workflow ? <EditorHeaderName workflowId={workflow.id} /> : null}
        </Panel>

        <Panel
          position="top-right"
          className="flex flex-col items-end gap-4"
        >
          <div className="flex gap-2">
            <ExecuteWorkflowBtn
              workflowId={workflowId}
              hasChanges={hasChanges}
            />
            <SaveWorkflowBtn
              workflowId={workflowId}
              hasChanges={hasChanges}
            />

            <Button
              size="icon-lg"
              variant={'outline'}
              className="bg-accent! border-primary! border-2!"
            >
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
