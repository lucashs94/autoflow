import { ipcRenderer } from 'electron'

export const nodes = {
  getOne: (nodeId: string) => ipcRenderer.invoke('nodes:getOne', nodeId),
  updateNodeName: (nodeId: string, name: string) =>
    ipcRenderer.invoke('nodes:updateName', nodeId, name),
}
