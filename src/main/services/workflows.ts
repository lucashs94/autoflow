import { createId } from '@paralleldrive/cuid2'
import type { Node as FlowNode } from '@xyflow/react'
import { edgesServiceType } from '../@types/workflows'
import {
  createWorkflow,
  getWorkflow,
  getWorkflows,
  updateWorkflow,
  updateWorkflowName,
} from '../db/workflows'

export function getWorkflowsService() {
  return getWorkflows()
}

export function getWorkflowService(workflowId: string) {
  return getWorkflow(workflowId)
}

export function createWorkflowService(name: string) {
  return createWorkflow(name)
}

export function updateWorkflowNameService(workflowId: string, name: string) {
  return updateWorkflowName(workflowId, name)
}

export function updateWorkflowService(
  workflowId: string,
  nodes: FlowNode[],
  edges: edgesServiceType[]
) {
  const nodeTypes = nodes.map((node) => ({
    id: createId(),
    workflowId,
    name: node.data.name as string,
    type: node.type as string,
    position: JSON.stringify(node.position || '{}'),
    data: JSON.stringify(node.data || ''),
  }))

  const edgeTypes = edges.map((edge) => ({
    id: createId(),
    workflowId,
    fromNodeId: edge.source,
    toNodeId: edge.target,
    fromOutput: edge.sourceHandle || '',
    toInput: edge.targetHandle || '',
  }))

  return updateWorkflow(workflowId, nodeTypes, edgeTypes)
}
