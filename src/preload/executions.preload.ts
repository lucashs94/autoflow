import { ipcRenderer } from 'electron'

export const executions = {
  navigateUrl: (url: string) =>
    ipcRenderer.invoke('execution:navigateUrl', url),
}
