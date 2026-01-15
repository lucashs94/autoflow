export type edgesServiceType = {
  id: string
  source: string
  target: string
  sourceHandle?: string | null | undefined
  targetHandle?: string | null | undefined
}

import type { Node, Edge } from '@xyflow/react'

export type WorkflowServiceReturnType = {
  id: string
  name: string
  headless: boolean
  nodes: Node[]
  edges: Edge[]
}
