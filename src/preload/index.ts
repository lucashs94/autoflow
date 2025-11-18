import { electronAPI } from '@electron-toolkit/preload'
import type { Node as FlowNode } from '@xyflow/react'
import { contextBridge, ipcRenderer } from 'electron'
import { edgesServiceType } from '../main/@types/workflows'

// Custom APIs for renderer
const api = {
  workflows: {
    getMany: () => ipcRenderer.invoke('workflows:getMany'),
    getOne: (workflowId: string) =>
      ipcRenderer.invoke('workflows:getOne', workflowId),
    create: (name: string) => ipcRenderer.invoke('workflows:create', name),
    updateWorkflowName: (workflowId: string, name: string) =>
      ipcRenderer.invoke('workflows:updateName', workflowId, name),
    updateWorkflow: (
      workflowId: string,
      nodes: FlowNode[],
      edges: edgesServiceType[]
    ) => ipcRenderer.invoke('workflows:update', workflowId, nodes, edges),
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
