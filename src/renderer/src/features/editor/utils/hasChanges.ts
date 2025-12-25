import { Edge, Node } from '@xyflow/react'
import { useMemo } from 'react'
import { normalizeFlow } from './normalizeFlow'

export function getSnapshot(workflow: any): string {
  return useMemo(() => {
    return JSON.stringify(normalizeFlow(workflow || {}))
  }, [workflow])
}

export function verifyHasChanges(
  nodes: Node[],
  edges: Edge[],
  snapshot: string
): boolean {
  return useMemo(() => {
    if (!snapshot) return false

    const current = normalizeFlow({
      nodes,
      edges,
    })

    return JSON.stringify(current) !== snapshot
  }, [nodes, edges, snapshot])
}
