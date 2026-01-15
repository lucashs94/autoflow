import { ConnectionLineCustom } from '@renderer/components/edges/connectionLines'
import { DeletableEdge } from '@renderer/components/edges/deletableEdge'
import { ErrorView } from '@renderer/components/errorView'
import { LoadingView } from '@renderer/components/loadingView'
import { nodeComponents } from '@renderer/config/nodeComponents'
import { editorAtom } from '@renderer/features/editor/store/atom'
import { ImportWorkflowDialog } from '@renderer/features/workflows/components/importDialog'
import {
  importWorkflow,
  validateWorkflowFile,
} from '@renderer/features/workflows/functions/importWorkflow'
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
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSetAtom } from 'jotai'
import { Loader2Icon, UploadIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { getSnapshot, verifyHasChanges } from '../../utils/hasChanges'
import { AddNodeBtn } from '../components/addNodeBtn'
import { EditorHeaderName } from '../components/editorHeaderName'
import { ExecuteWorkflowBtn } from '../components/executeWorkflowBtn'
import { SaveWorkflowBtn } from '../components/saveWorkflowBtn'
import { WorkflowOptionsMenu } from '../components/workflowOptionsMenu'

const edgeTypes = {
  default: DeletableEdge,
}

export function Editor({ workflowId }: { workflowId: string }) {
  const setEditorInstance = useSetAtom(editorAtom)
  const saveWorkflow = useUpdateWorkflow()

  const { data: workflow } = useWorkflow(workflowId)

  const [nodes, setNodes] = useState<Node[]>(workflow?.nodes || [])
  const [edges, setEdges] = useState<Edge[]>(workflow?.edges || [])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingFile(false)

      const file = e.dataTransfer.files[0]
      if (!file || !validateWorkflowFile(file)) return

      try {
        setIsImporting(true)
        await importWorkflow({
          file,
          workflowId,
          currentNodes: nodes,
          currentEdges: edges,
        })

        window.location.reload()
      } catch (error) {
        console.error('Failed to import workflow:', error)
        setIsImporting(false)
      }
    },
    [workflowId, nodes, edges]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if dragging a file (not a node)
    const hasFiles = e.dataTransfer.types.includes('Files')
    if (hasFiles) {
      setIsDraggingFile(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Only hide overlay if leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDraggingFile(false)
    }
  }, [])

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

  return (
    <div
      className="size-full bg-muted relative"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* File drop overlay */}
      {(isDraggingFile || isImporting) && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-lg border-2 border-dashed border-primary bg-background">
            {isImporting ? (
              <>
                <Loader2Icon className="size-12 text-primary animate-spin" />
                <p className="text-lg font-medium">Importing workflow...</p>
              </>
            ) : (
              <>
                <UploadIcon className="size-12 text-primary" />
                <p className="text-lg font-medium">Drop JSON file to import</p>
              </>
            )}
          </div>
        </div>
      )}

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
        multiSelectionKeyCode={['Meta', 'Control']}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
        fitView
        snapToGrid
        snapGrid={[10, 10]}
        proOptions={{
          hideAttribution: true,
        }}
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

            <WorkflowOptionsMenu
              workflowId={workflowId}
              workflowName={workflow?.name || ''}
              headless={workflow?.headless ?? true}
              onImport={() => setIsImportDialogOpen(true)}
            />
          </div>

          <div>
            <AddNodeBtn />
          </div>
        </Panel>
      </ReactFlow>

      <ImportWorkflowDialog
        workflowId={workflowId}
        currentNodes={nodes}
        currentEdges={edges}
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportSuccess={() => window.location.reload()}
      />
    </div>
  )
}

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />
}

export const EditorError = () => {
  return <ErrorView message="Error loading editor..." />
}
