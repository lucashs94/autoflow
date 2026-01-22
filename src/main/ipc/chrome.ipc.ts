import { ipcMain, BrowserWindow } from 'electron'
import {
  getChromeStatus,
  downloadChrome,
  isChromeAvailable,
  type ChromeStatus,
  type ChromeDownloadProgress,
} from '../puppeteer/chromium'
import { success, errorFromException, IPCErrorCode, type IPCResult } from '../../shared/@types/ipc-response'

// Get current Chrome status
ipcMain.handle('chrome:getStatus', async (): Promise<IPCResult<ChromeStatus>> => {
  try {
    const status = getChromeStatus()
    return success(status)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.UNKNOWN_ERROR)
  }
})

// Check if Chrome is available
ipcMain.handle('chrome:isAvailable', async (): Promise<IPCResult<boolean>> => {
  try {
    const available = isChromeAvailable()
    return success(available)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.UNKNOWN_ERROR)
  }
})

// Download Chrome with progress updates
ipcMain.handle('chrome:download', async (event): Promise<IPCResult<string>> => {
  try {
    const webContents = event.sender
    const window = BrowserWindow.fromWebContents(webContents)

    const chromePath = await downloadChrome((progress: ChromeDownloadProgress) => {
      // Send progress updates to renderer
      if (window && !window.isDestroyed()) {
        webContents.send('chrome:downloadProgress', progress)
      }
    })

    return success(chromePath)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.UNKNOWN_ERROR)
  }
})
