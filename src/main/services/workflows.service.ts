import type { Node as FlowNode } from '@xyflow/react'
import { edgesServiceType } from '../@types/workflows'
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflows,
  updateWorkflow,
  updateWorkflowName,
} from '../db/workflows'

export function getWorkflowsService() {
  return getWorkflows()
}

export function getWorkflowService(workflowId: string) {
  const { workflow, nodes, edges: oldEdges } = getWorkflow(workflowId)

  nodes.forEach((node) => {
    node.position = JSON.parse(node.position)
    node.data = JSON.parse(node.data)
  })

  const edges = oldEdges.map((edge) => ({
    id: edge.id,
    source: edge.fromNodeId,
    target: edge.toNodeId,
    sourceHandle: edge.fromOutput,
    targetHandle: edge.toInput,
  }))

  return { id: workflow.id, name: workflow.name, nodes, edges }
}

export function createWorkflowService(name: string) {
  return createWorkflow(name)
}

export function updateWorkflowNameService(workflowId: string, name: string) {
  return updateWorkflowName(workflowId, name)
}

export function deleteWorkflowService(workflowId: string) {
  return deleteWorkflow(workflowId)
}

export function updateWorkflowService(
  workflowId: string,
  nodes: FlowNode[],
  edges: edgesServiceType[]
) {
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

  try {
    updateWorkflow(workflowId, nodeTypes, edgeTypes)
  } catch (error) {
    throw new Error('Algo aconteceu de 4rrado')
  }
}
