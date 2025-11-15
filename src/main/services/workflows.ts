import {
  createWorkflow,
  getWorkflow,
  getWorkflows,
  updateWorkflowName,
} from '../db/workflows'

export function getWorkflowsService() {
  return getWorkflows()
}

export function getWorkflowService(workflowId: string) {
  return getWorkflow(workflowId)
}

export function createWorkflowService(name: string) {
  return createWorkflow(name)
}

export function updateWorkflowNameService(workflowId: string, name: string) {
  return updateWorkflowName(workflowId, name)
}
