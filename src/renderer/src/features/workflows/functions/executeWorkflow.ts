import { publishStatus } from '@renderer/features/tasks/channels/nodeStatusChannel'
import {
  getExecutor,
  registerAllExecutors,
} from '@renderer/features/tasks/registries/executorRegistry'
import { NodeType } from '@renderer/types/nodes'
import { isSuccess } from '@shared/@types/ipc-response'
import { topologicalSort } from '../utils/topologicalSort'

export async function executeWorkflow(
  workflowId: string
): Promise<{ workflowId: string; context: Record<string, unknown> }> {
  const result = await window.api.workflows.getOne(workflowId)

  if (!isSuccess(result)) {
    throw new Error(result.error.message)
  }

  const workflow = result.data

  const initialNode = workflow.nodes.find((n) => n.type === NodeType.INITIAL)
  if (!initialNode) {
    throw new Error(`Workflow must have an initial node!`)
  }

  ;(async () => {
    workflow.nodes.forEach((node) => {
      publishStatus({
        nodeId: node.id,
        status: 'initial',
      })
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })()

  registerAllExecutors()

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
  }

  // IPC finish flow

  return {
    workflowId,
    context,
  }
}
