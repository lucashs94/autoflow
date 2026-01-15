import type { Edge } from '@xyflow/react'

/**
 * Finds the next node to execute based on outgoing edges.
 *
 * @param edges - The outgoing edges from the current node
 * @param handleId - Optional handle ID to filter by (e.g., 'true', 'false', 'done', 'loop')
 *                   If not provided, finds the default edge (no handle or 'main')
 * @returns The target node ID or null if no matching edge found
 */
// Handle IDs that are used for branching (not default flow)
const SPECIAL_HANDLES = ['true', 'false', 'done', 'loop']

export function findNextNode(
  edges: Edge[],
  handleId?: string
): string | null {
  const edge = edges.find((e) => {
    if (handleId) {
      // Looking for a specific handle (e.g., 'true', 'false', 'done')
      return e.sourceHandle === handleId
    }

    // Looking for default edge - accept:
    // - undefined/null sourceHandle
    // - 'main'
    // - 'source-1' (default handle ID from BaseExecutionNode)
    // - any handle that is NOT a special branching handle
    if (!e.sourceHandle || e.sourceHandle === 'main' || e.sourceHandle === 'source-1') {
      return true
    }

    // If it's not a special handle, treat it as default
    return !SPECIAL_HANDLES.includes(e.sourceHandle)
  })

  return edge?.target ?? null
}
