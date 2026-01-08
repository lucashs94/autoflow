export type WorkflowContext = Record<string, unknown>

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData
  nodeId: string
  workflowId: string
  context: WorkflowContext
  signal?: AbortSignal
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>
