import { createId } from '@paralleldrive/cuid2'
import { Edge, Node } from '@xyflow/react'
import { isSuccess } from '@shared/@types/ipc-response'

interface ImportedWorkflow {
  version: string
  exportedAt: string
  workflow: {
    name: string
    description?: string
    settings?: {
      headless?: boolean
    }
    nodes: Array<{
      id: string
      type: string
      position: { x: number; y: number }
      data: Record<string, unknown>
      width?: number
      height?: number
      zIndex?: number
      style?: Record<string, unknown>
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      sourceHandle?: string
      targetHandle?: string
    }>
  }
}

interface ImportResult {
  workflowId: string
  name: string
}

interface ImportOptions {
  file: File
  workflowId: string
  currentNodes: Node[]
  currentEdges: Edge[]
}

const VERTICAL_OFFSET = 200 // Space between existing and imported nodes

export async function importWorkflow({
  file,
  workflowId,
  currentNodes,
  currentEdges,
}: ImportOptions): Promise<ImportResult> {
  // Read file content
  const content = await file.text()

  // Parse JSON
  let data: ImportedWorkflow
  try {
    data = JSON.parse(content)
  } catch {
    throw new Error('Invalid JSON file')
  }

  // Validate structure
  validateImportedWorkflow(data)

  // Use current editor state (not from DB) to check existing nodes
  const existingNodes = currentNodes
  const existingEdges = currentEdges

  // Check if workflow has nodes beyond INITIAL
  const hasOnlyInitial = existingNodes.every((node) => node.type === 'INITIAL')

  // Generate new IDs for imported nodes and edges
  const idMap = new Map<string, string>()

  // Filter out INITIAL node from imported nodes if we're merging
  const importedNodesFiltered = hasOnlyInitial
    ? data.workflow.nodes
    : data.workflow.nodes.filter((node) => node.type !== 'INITIAL')

  // Get the ID of the INITIAL node from imported data (to filter edges)
  const importedInitialId = data.workflow.nodes.find((n) => n.type === 'INITIAL')?.id

  // Filter out edges connected to INITIAL if we're merging
  const importedEdgesFiltered = hasOnlyInitial
    ? data.workflow.edges
    : data.workflow.edges.filter(
        (edge) => edge.source !== importedInitialId && edge.target !== importedInitialId
      )

  // Map old IDs to new IDs
  importedNodesFiltered.forEach((node) => {
    idMap.set(node.id, createId())
  })

  // Calculate vertical offset for imported nodes (place below existing)
  let yOffset = 0
  if (!hasOnlyInitial) {
    const maxY = Math.max(...existingNodes.map((n) => n.position.y))
    yOffset = maxY + VERTICAL_OFFSET
  }

  // Transform imported nodes with new IDs and offset
  const transformedNodes = importedNodesFiltered.map((node) => {
    const base = {
      id: idMap.get(node.id)!,
      type: node.type,
      position: {
        x: node.position.x,
        y: hasOnlyInitial ? node.position.y : node.position.y + yOffset,
      },
      data: node.data,
    }
    if (node.type === 'STICKY_NOTE') {
      return {
        ...base,
        ...(node.width !== undefined && { width: node.width }),
        ...(node.height !== undefined && { height: node.height }),
        ...(node.zIndex !== undefined && { zIndex: node.zIndex }),
        ...(node.style && { style: node.style }),
      }
    }
    return base
  })

  // Transform imported edges with new IDs
  const transformedEdges = importedEdgesFiltered.map((edge) => ({
    id: createId(),
    source: idMap.get(edge.source) || edge.source,
    target: idMap.get(edge.target) || edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }))

  // Merge or replace based on existing content
  const finalNodes = hasOnlyInitial
    ? transformedNodes
    : [...existingNodes, ...transformedNodes]

  const finalEdges = hasOnlyInitial
    ? transformedEdges
    : [...existingEdges, ...transformedEdges]

  const importedName = data.workflow.name

  // Update workflow name
  const nameResult = await window.api.workflows.updateWorkflowName(
    workflowId,
    importedName
  )

  if (!isSuccess(nameResult)) {
    throw new Error(`Failed to update workflow name: ${nameResult.error.message}`)
  }

  // Update workflow with final nodes and edges
  const updateResult = await window.api.workflows.updateWorkflow(
    workflowId,
    finalNodes,
    finalEdges
  )

  if (!isSuccess(updateResult)) {
    throw new Error(`Failed to import workflow: ${updateResult.error.message}`)
  }

  return { workflowId, name: importedName }
}

function validateImportedWorkflow(data: unknown): asserts data is ImportedWorkflow {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid workflow file format')
  }

  const obj = data as Record<string, unknown>

  if (!obj.version || typeof obj.version !== 'string') {
    throw new Error('Missing or invalid version field')
  }

  if (!obj.workflow || typeof obj.workflow !== 'object') {
    throw new Error('Missing workflow data')
  }

  const workflow = obj.workflow as Record<string, unknown>

  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error('Missing workflow name')
  }

  if (!Array.isArray(workflow.nodes)) {
    throw new Error('Missing or invalid nodes array')
  }

  if (!Array.isArray(workflow.edges)) {
    throw new Error('Missing or invalid edges array')
  }

  // Validate nodes
  for (const node of workflow.nodes) {
    if (!node || typeof node !== 'object') {
      throw new Error('Invalid node structure')
    }

    const n = node as Record<string, unknown>
    if (!n.id || !n.type || !n.position) {
      throw new Error('Node missing required fields (id, type, position)')
    }
  }

  // Validate edges
  for (const edge of workflow.edges) {
    if (!edge || typeof edge !== 'object') {
      throw new Error('Invalid edge structure')
    }

    const e = edge as Record<string, unknown>
    if (!e.id || !e.source || !e.target) {
      throw new Error('Edge missing required fields (id, source, target)')
    }
  }
}

export function validateWorkflowFile(file: File): boolean {
  return file.type === 'application/json' || file.name.endsWith('.json')
}
