import { Edge, Node } from '@xyflow/react'
import toposort from 'toposort'

export function topologicalSort(nodes: Node[], connections: Edge[]): Node[] {
  // No connections, independent nodes
  if (connections.length === 0) return nodes

  // edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.source,
    conn.target,
  ])

  // Add nodes with no connections as self-edges to ensure they are included
  const connectedNodeIds = new Set<string>()
  for (const conn of connections) {
    connectedNodeIds.add(conn.source)
    connectedNodeIds.add(conn.target)
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id])
    }
  }

  // Perform topological sort
  let sortedNodeIds: string[]
  try {
    sortedNodeIds = toposort(edges)

    // remove duplicates
    sortedNodeIds = [...new Set(sortedNodeIds)]
  } catch (err) {
    if (err instanceof Error && err.message.includes('Cyclic')) {
      throw new Error('Workflow contains a cycle')
    }

    throw err
  }

  // Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean)
}
