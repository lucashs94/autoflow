import type { Node as FlowNode } from '@xyflow/react'
import { ipcRenderer } from 'electron'
import { edgesServiceType } from '../main/@types/workflows'

export const workflows = {
  getMany: () => ipcRenderer.invoke('workflows:getMany'),
  getOne: (workflowId: string) =>
    ipcRenderer.invoke('workflows:getOne', workflowId),
  create: (name: string) => ipcRenderer.invoke('workflows:create', name),
  delete: (workflowId: string) =>
    ipcRenderer.invoke('workflows:delete', workflowId),
  updateWorkflowName: (workflowId: string, name: string) =>
    ipcRenderer.invoke('workflows:updateName', workflowId, name),
  updateWorkflow: (
    workflowId: string,
    nodes: FlowNode[],
    edges: edgesServiceType[]
  ) => ipcRenderer.invoke('workflows:update', workflowId, nodes, edges),
  updateHeadless: (workflowId: string, headless: boolean) =>
    ipcRenderer.invoke('workflows:updateHeadless', workflowId, headless),
}
