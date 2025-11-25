export type WorkflowType = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export type WorkflowReturnType = {
  id: string
  name: string
  nodes: NodeType[]
  edges: EdgeType[]
}

export type NodeType = {
  id: string
  workflowId: string
  type: string
  position: string
  data: string
  createdAt: number
  updatedAt: number
}

export type CreateNodeType = Omit<NodeType, 'createdAt' | 'updatedAt'>

export type EdgeType = {
  id: string
  workflowId: string
  fromNodeId: string
  toNodeId: string
  fromOutput: string
  toInput: string
  createdAt: number
  updatedAt: number
}

export type CreateEdgeType = Omit<EdgeType, 'createdAt' | 'updatedAt'>
