import { Node as FlowNode, Edge } from '@xyflow/react'
import { NodeType } from '@renderer/types/nodes'

/**
 * Get available template variables based on workflow topology
 * Returns variables that are available at a given node
 */
export function getAvailableVariables(
  currentNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): string[] {
  const variables: Set<string> = new Set()

  // Find all nodes that come before the current node
  const previousNodes = getNodesBeforeCurrent(currentNodeId, nodes, edges)

  previousNodes.forEach(node => {
    // Add node name as the primary variable (this is what users reference)
    const nodeName = (node.data as any)?.name
    if (nodeName && nodeName !== 'Initial' && node.type !== NodeType.INITIAL) {
      variables.add(nodeName)
    }

    // Extract variables from SetVariables nodes
    if (node.type === NodeType.SET_VARIABLES) {
      const data = node.data as any
      if (data.variables && Array.isArray(data.variables)) {
        data.variables.forEach((v: any) => {
          if (v.name) {
            variables.add(v.name)
          }
        })
      }
    }

    // Extract loop context variables
    if (node.type === NodeType.LOOP) {
      const data = node.data as any
      if (data.name) {
        variables.add(`${data.name}.item`)
      }
    }
  })

  // Check if current node is inside a loop
  const loopContext = getLoopContext(currentNodeId, nodes, edges)
  if (loopContext) {
    variables.add(`${loopContext}.item`)
  }

  return Array.from(variables).sort()
}

/**
 * Get all nodes that execute before the current node
 */
function getNodesBeforeCurrent(
  currentNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): FlowNode[] {
  const visited = new Set<string>()
  const result: FlowNode[] = []

  function traverse(nodeId: string) {
    if (visited.has(nodeId) || nodeId === currentNodeId) return
    visited.add(nodeId)

    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      result.push(node)
    }

    // Find all edges that point to this node
    const incomingEdges = edges.filter(e => e.target === nodeId)
    incomingEdges.forEach(edge => {
      traverse(edge.source)
    })
  }

  // Start traversal from current node's predecessors
  const incomingEdges = edges.filter(e => e.target === currentNodeId)
  incomingEdges.forEach(edge => {
    traverse(edge.source)
  })

  return result
}

/**
 * Check if current node is inside a loop and return loop variable name
 */
function getLoopContext(
  currentNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): string | null {
  // Find if there's a loop node in the path to current node
  const previousNodes = getNodesBeforeCurrent(currentNodeId, nodes, edges)

  const loopNode = previousNodes.find(node => node.type === NodeType.LOOP)

  if (loopNode) {
    const data = loopNode.data as any
    return data.name || null
  }

  return null
}

/**
 * Get all available variables including common context variables
 */
export function getAllAvailableVariables(
  currentNodeId: string,
  nodes: FlowNode[],
  edges: Edge[]
): string[] {
  const workflowVars = getAvailableVariables(currentNodeId, nodes, edges)

  // Add common/built-in variables if needed
  // const builtInVars = ['timestamp', 'date', 'time']

  return [...workflowVars]
}
