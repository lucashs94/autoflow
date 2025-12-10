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

  // TODO: Add Types
  // const nodesWithoutInitial = workflow.nodes.filter(
  //   (n) => n.type !== NodeType.INITIAL
  // )

  // Define topological order
  const sorted = topologicalSort(workflow.nodes, workflow.edges)

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
    })

    console.log(context)
  }

  // IPC finish flow

  return {
    workflowId,
    context,
  }
}
