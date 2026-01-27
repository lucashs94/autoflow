import { ipcRenderer } from 'electron'

export type ChromeDownloadProgress = {
  percent: number
  downloadedBytes: number
  totalBytes: number
}

export type ChromeStatus = {
  available: boolean
  source: 'system' | 'downloaded' | 'none'
  path: string | null
}

export const chrome = {
  getStatus: () => ipcRenderer.invoke('chrome:getStatus'),
  isAvailable: () => ipcRenderer.invoke('chrome:isAvailable'),
  download: () => ipcRenderer.invoke('chrome:download'),
  onDownloadProgress: (callback: (progress: ChromeDownloadProgress) => void) => {
    const handler = (_: Electron.IpcRendererEvent, progress: ChromeDownloadProgress) => {
      callback(progress)
    }
    ipcRenderer.on('chrome:downloadProgress', handler)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('chrome:downloadProgress', handler)
    }
  },
  onStatusChanged: (callback: () => void) => {
    const handler = () => {
      callback()
    }
    ipcRenderer.on('chrome:statusChanged', handler)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('chrome:statusChanged', handler)
    }
  },
}
