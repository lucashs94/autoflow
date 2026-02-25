import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { chrome } from './chrome.preload'
import { executions } from './executions.preload'
import { history } from './history.preload'
import { nodes } from './nodes.preload'
import { workflows } from './workflows.preload'

// Custom APIs for renderer
const api = {
  app: {
    signalReady: () => ipcRenderer.send('app:ready'),
  },
  chrome,
  workflows,
  nodes,
  executions,
  history,
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
