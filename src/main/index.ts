import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, screen, shell } from 'electron'
import path, { join } from 'path'
import icon from './assets/icon.png?asset'
import './ipc'

app.setName('Web Automation')
if (process.platform === 'darwin') {
  app.dock?.setIcon(path.join(icon))
}

app.setAboutPanelOptions({
  applicationName: 'Web Automation',
  applicationVersion: '1.0.0',
  copyright: '© 2026 LHS Dev',
})

export let mainWindow: BrowserWindow | null = null
let splashShown = false

function createWindow(showImmediately = false): void {
  mainWindow = new BrowserWindow({
    title: 'Web Automation',
    width: 1400,
    height: 800,
    minHeight: 670,
    minWidth: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (showImmediately) {
    mainWindow.once('ready-to-show', () => mainWindow?.show())
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createSplashWindow(): BrowserWindow {
  const W = 380
  const H = 240
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const x = Math.round(workArea.x + (workArea.width - W) / 2)
  const y = Math.round(workArea.y + (workArea.height - H) / 2)

  const splash = new BrowserWindow({
    width: W,
    height: H,
    x,
    y,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    show: false,
    webPreferences: { sandbox: true },
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splash.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splash.loadFile(join(__dirname, '../renderer/splash.html'))
  }

  splash.once('ready-to-show', () => splash.show())

  return splash
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const splash = createSplashWindow()
  createWindow()

  const appReadyPromise = new Promise<void>((resolve) => {
    ipcMain.once('app:ready', () => resolve())
  })

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  Promise.all([appReadyPromise, sleep(3000)]).then(() => {
    splash.close()
    if (mainWindow) {
      mainWindow.show()
    }
    splashShown = true
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(splashShown)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
