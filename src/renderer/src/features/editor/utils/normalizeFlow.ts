import { Edge, Node } from '@xyflow/react'

export function normalizeFlow(input: { nodes: Node[]; edges: Edge[] }) {
  return {
    nodes: input.nodes
      .map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: n.position
          ? {
              x: Math.round(n.position.x),
              y: Math.round(n.position.y),
            }
          : undefined,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),

    edges: input.edges
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type,
        data: e.data,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }
}
