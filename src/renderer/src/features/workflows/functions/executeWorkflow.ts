import { getExecutor } from '@renderer/features/tasks/registries/executorRegistry'
import { NodeType } from '@renderer/types/nodes'
import { topologicalSort } from '../utils/topologicalSort'

export async function executeWorkflow(
  workflowId: string
): Promise<{ workflowId: string; context: Record<string, unknown> }> {
  // Get nodes and edges
  const workflow = await window.api.workflows.getOne(workflowId)

  if (!workflow) {
    throw new Error(`Workflow not found!`)
  }

  const initialNode = workflow.nodes.find((n) => n.type === NodeType.INITIAL)

  if (!initialNode) {
    throw new Error(`Workflow must have an initial node!`)
  }

  // TODO: Add Types

  // Define topological order
  const sorted = topologicalSort(workflow.nodes, workflow.edges, initialNode)

  console.log(sorted)

  // Initialize the Context
  let context = {}

  // IPC start flow

  // Loop on each node and run the executor
  for (const node of sorted) {
    if (node.type === NodeType.INITIAL) continue

    const executor = getExecutor(node.type as NodeType)

    context = await executor({
      data: node.data as Record<string, unknown>,
      context,
      nodeId: node.id,
      workflowId,
    })

    console.log(context)
  }

  // IPC finish flow

  return {
    workflowId,
    context,
  }
}
