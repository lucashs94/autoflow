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
    const parsedNodes = nodes.map((node) => ({
      ...node,
      position: JSON.parse(node.position as string),
      data: JSON.parse(node.data as string),
    })) as FlowNode[]

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
    const nodeTypes = nodes.map((node) => ({
      id: node.id,
      workflowId,
      type: node.type as string,
      position: JSON.stringify(node.position || '{}'),
      data: JSON.stringify(node.data || ''),
    }))

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

    // Transform nodes with new IDs
    const newNodes = original.nodes.map((node) => ({
      id: idMap.get(node.id)!,
      workflowId: newWorkflowId,
      type: node.type as string,
      position: JSON.stringify(node.position),
      data: JSON.stringify(node.data),
    }))

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
