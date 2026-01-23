import { createId } from '@paralleldrive/cuid2'
import type { Node as FlowNode } from '@xyflow/react'
import { edgesServiceType, WorkflowServiceReturnType } from '../@types/workflows'
import type { WorkflowType } from '../db/types'
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflows,
  updateWorkflow,
  updateWorkflowHeadless,
  updateWorkflowName,
} from '../db/workflows'
import {
  IPCResult,
  success,
  errorFromException,
  IPCErrorCode,
  IPCOperationError,
} from '../../shared/@types/ipc-response'

export function getWorkflowsService(): IPCResult<WorkflowType[]> {
  try {
    const workflows = getWorkflows().sort((a, b) => b.createdAt - a.createdAt)
    return success(workflows)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function getWorkflowService(
  workflowId: string
): IPCResult<WorkflowServiceReturnType> {
  try {
    const { workflow, nodes, edges: oldEdges } = getWorkflow(workflowId)

    if (!workflow) {
      throw new IPCOperationError(
        IPCErrorCode.WORKFLOW_NOT_FOUND,
        `Workflow with id ${workflowId} not found`,
        { workflowId }
      )
    }

    // Parse JSON strings to objects and transform to ReactFlow types
    const parsedNodes = nodes.map((node) => {
      const parsedData = JSON.parse(node.data as string)

      // Only sticky notes need style, width, height, and zIndex restoration
      if (node.type === 'STICKY_NOTE') {
        const { __style, __zIndex, __width, __height, ...data } = parsedData

        // Build style object with dimensions
        const style = {
          ...(__style || {}),
          ...(__width !== undefined && { width: __width }),
          ...(__height !== undefined && { height: __height }),
        }

        return {
          id: node.id,
          type: node.type,
          position: JSON.parse(node.position as string),
          data,
          style: Object.keys(style).length > 0 ? style : undefined,
          ...(__zIndex !== undefined && { zIndex: __zIndex }),
          ...(__width !== undefined && { width: __width }),
          ...(__height !== undefined && { height: __height }),
        }
      }

      return {
        id: node.id,
        type: node.type,
        position: JSON.parse(node.position as string),
        data: parsedData,
      }
    }) as FlowNode[]

    const parsedEdges = oldEdges.map((edge) => ({
      id: edge.id,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      sourceHandle: edge.fromOutput || undefined,
      targetHandle: edge.toInput || undefined,
    }))

    return success({
      id: workflow.id,
      name: workflow.name,
      headless: workflow.headless === 1,
      nodes: parsedNodes,
      edges: parsedEdges,
    })
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function createWorkflowService(
  name: string
): IPCResult<{ workflowId: string; name: string }> {
  try {
    if (!name || name.trim() === '') {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Workflow name cannot be empty'
      )
    }

    const result = createWorkflow(name)
    return success(result)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function updateWorkflowNameService(
  workflowId: string,
  name: string
): IPCResult<void> {
  try {
    if (!name || name.trim() === '') {
      throw new IPCOperationError(
        IPCErrorCode.VALIDATION_ERROR,
        'Workflow name cannot be empty'
      )
    }

    updateWorkflowName(workflowId, name)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function deleteWorkflowService(workflowId: string): IPCResult<void> {
  try {
    deleteWorkflow(workflowId)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function updateWorkflowHeadlessService(
  workflowId: string,
  headless: boolean
): IPCResult<void> {
  try {
    updateWorkflowHeadless(workflowId, headless)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function updateWorkflowService(
  workflowId: string,
  nodes: FlowNode[],
  edges: edgesServiceType[]
): IPCResult<void> {
  try {
    const nodeTypes = nodes.map((node) => {
      // Only sticky notes need style, width, height, and zIndex persistence
      const isStickyNote = node.type === 'STICKY_NOTE'

      // Get dimensions from multiple possible sources (style, direct props, or measured)
      const width = node.width ?? node.measured?.width ?? node.style?.width
      const height = node.height ?? node.measured?.height ?? node.style?.height

      const data = isStickyNote
        ? {
            ...node.data,
            ...(node.style && { __style: node.style }),
            ...(node.zIndex !== undefined && { __zIndex: node.zIndex }),
            ...(width !== undefined && { __width: width }),
            ...(height !== undefined && { __height: height }),
          }
        : node.data

      return {
        id: node.id,
        workflowId,
        type: node.type as string,
        position: JSON.stringify(node.position || '{}'),
        data: JSON.stringify(data || ''),
      }
    })

    const edgeTypes = edges.map((edge) => ({
      id: edge.id,
      workflowId,
      fromNodeId: edge.source,
      toNodeId: edge.target,
      fromOutput: edge.sourceHandle || '',
      toInput: edge.targetHandle || '',
    }))

    updateWorkflow(workflowId, nodeTypes, edgeTypes)
    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function duplicateWorkflowService(
  workflowId: string
): IPCResult<{ workflowId: string; name: string }> {
  try {
    // Get the original workflow
    const originalResult = getWorkflowService(workflowId)
    if (!originalResult.success) {
      return originalResult as IPCResult<{ workflowId: string; name: string }>
    }

    const original = originalResult.data

    // Create new workflow with "(copy)" suffix
    const newName = `${original.name} (copy)`
    const createResult = createWorkflow(newName)
    const newWorkflowId = createResult.workflowId

    // Generate new IDs for nodes and map old to new
    const idMap = new Map<string, string>()
    original.nodes.forEach((node) => {
      idMap.set(node.id, createId())
    })

    // Transform nodes with new IDs (only sticky notes need style/zIndex/width/height)
    const newNodes = original.nodes.map((node) => {
      const isStickyNote = node.type === 'STICKY_NOTE'

      // Get dimensions from multiple possible sources
      const width = node.width ?? node.measured?.width ?? node.style?.width
      const height = node.height ?? node.measured?.height ?? node.style?.height

      const data = isStickyNote
        ? {
            ...node.data,
            ...(node.style && { __style: node.style }),
            ...(node.zIndex !== undefined && { __zIndex: node.zIndex }),
            ...(width !== undefined && { __width: width }),
            ...(height !== undefined && { __height: height }),
          }
        : node.data

      return {
        id: idMap.get(node.id)!,
        workflowId: newWorkflowId,
        type: node.type as string,
        position: JSON.stringify(node.position),
        data: JSON.stringify(data),
      }
    })

    // Transform edges with new IDs
    const newEdges = original.edges.map((edge) => ({
      id: createId(),
      workflowId: newWorkflowId,
      fromNodeId: idMap.get(edge.source) || edge.source,
      toNodeId: idMap.get(edge.target) || edge.target,
      fromOutput: edge.sourceHandle || '',
      toInput: edge.targetHandle || '',
    }))

    // Save the duplicated workflow
    updateWorkflow(newWorkflowId, newNodes, newEdges)

    // Copy headless setting
    updateWorkflowHeadless(newWorkflowId, original.headless)

    return success({ workflowId: newWorkflowId, name: newName })
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}
