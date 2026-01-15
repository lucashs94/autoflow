import type { Edge } from '@xyflow/react'

export type WorkflowContext = Record<string, unknown>

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData
  nodeId: string
  workflowId: string
  context: WorkflowContext
  signal?: AbortSignal
  executionId?: string
  outgoingEdges: Edge[]
}

export interface NodeExecutorResult {
  context: WorkflowContext
  nextNodeId: string | null
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<NodeExecutorResult>
