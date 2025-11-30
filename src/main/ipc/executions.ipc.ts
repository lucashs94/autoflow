import { ipcMain } from 'electron'
import { navigateUrlService } from '../services/executions.service'

ipcMain.handle('execution:navigateUrl', async (_, url: string) =>
  navigateUrlService(url)
)
