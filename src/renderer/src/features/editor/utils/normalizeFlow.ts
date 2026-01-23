import { Edge, Node } from '@xyflow/react'

export function normalizeFlow(input: { nodes: Node[]; edges: Edge[] }) {
  return {
    nodes: input.nodes
      .map((n) => {
        const base = {
          id: n.id,
          type: n.type,
          data: n.data,
          position: n.position
            ? {
                x: Math.round(n.position.x),
                y: Math.round(n.position.y),
              }
            : undefined,
        }

        // Include normalized dimensions for sticky notes
        if (n.type === 'STICKY_NOTE') {
          // Get dimensions from any source and round them for consistent comparison
          const width = n.width ?? n.measured?.width ?? n.style?.width
          const height = n.height ?? n.measured?.height ?? n.style?.height

          return {
            ...base,
            zIndex: n.zIndex,
            // Normalize dimensions to rounded numbers for comparison
            width: width !== undefined ? Math.round(Number(width)) : undefined,
            height: height !== undefined ? Math.round(Number(height)) : undefined,
          }
        }

        return base
      })
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
