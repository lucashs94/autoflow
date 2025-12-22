import { NodeType } from '@renderer/types/nodes'
import { Edge, getIncomers, Node } from '@xyflow/react'

/**
 * Sorts nodes in topological order.
 *
 * @param nodes - The nodes of the workflow.
 * @param connections - The connections between nodes.
 * @param rootNode - The first node from where the sort should start.
 * @returns The nodes in topological order.
 */

export function topologicalSort(
  nodes: Node[],
  connections: Edge[],
  rootNode: Node
): Node[] {
  // No connections, independent nodes
  if (connections.length === 0) return nodes

  if (!rootNode) {
    throw new Error('Workflow must have a root node')
  }

  const reachable = new Set<string>()
  const stack = [rootNode.id]

  const hasLoopHandleFromRoot = connections.some(
    (c) => c.source === rootNode.id && c.sourceHandle === 'loop'
  )

  while (stack.length > 0) {
    const cur = stack.pop()!

    if (reachable.has(cur)) continue
    reachable.add(cur)

    for (const c of connections) {
      if (cur === rootNode.id && hasLoopHandleFromRoot) {
        if (c.sourceHandle !== 'loop') continue
      }

      if (c.source === cur && !reachable.has(c.target)) {
        stack.push(c.target)
      }
    }
  }

  const isExternal = rootNode.type === NodeType.INITIAL ? 'done' : 'loop'

  const queue: Node[] = [rootNode]
  const planned = new Set<string>([rootNode.id])

  while (true) {
    let added = false

    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue
      if (!reachable.has(currentNode.id)) continue

      const incomers = getIncomers(currentNode, nodes, connections)
        .filter((i) => reachable.has(i.id))
        .filter((i) => {
          if (rootNode.type === NodeType.LOOP) return true

          const edge = connections.find(
            (c) => c.source === i.id && c.target === currentNode.id
          )
          if (!edge) return false

          if (i.type !== NodeType.LOOP) return true

          return edge.sourceHandle === isExternal
        })

      if (incomers.length === 0) continue
      if (!incomers.every((i) => planned.has(i.id))) continue

      queue.push(currentNode)
      planned.add(currentNode.id)
      added = true
    }

    if (!added) break
  }

  return queue
}
