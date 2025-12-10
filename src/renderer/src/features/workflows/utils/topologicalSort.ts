import { NodeType } from '@renderer/types/nodes'
import { Edge, getIncomers, Node } from '@xyflow/react'

export function topologicalSort(nodes: Node[], connections: Edge[]): Node[] {
  // No connections, independent nodes
  if (connections.length === 0) return nodes

  // Seleciona o node inicial
  const initialNode = nodes.find((n) => n.type === NodeType.INITIAL)
  if (!initialNode) {
    throw new Error('Workflow must have an initial node')
  }

  const reachable = new Set<string>()
  const stack = [initialNode.id]

  while (stack.length > 0) {
    const cur = stack.pop()!
    if (reachable.has(cur)) continue
    reachable.add(cur)

    for (const c of connections) {
      if (c.source === cur && !reachable.has(c.target)) {
        stack.push(c.target)
      }
    }
  }

  const queue: Node[] = [initialNode]
  const planned = new Set<string>()
  planned.add(initialNode.id)

  while (true) {
    let added = false

    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) continue
      if (!reachable.has(currentNode.id)) continue

      const incomers = getIncomers(currentNode, nodes, connections).filter(
        (i) => reachable.has(i.id)
      )
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
