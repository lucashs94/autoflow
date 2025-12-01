import { ipcMain } from 'electron'
import {
  clickElementService,
  navigateUrlService,
  typeTextService,
} from '../services/executions.service'

ipcMain.handle('execution:navigateUrl', async (_, url: string) =>
  navigateUrlService(url)
)

ipcMain.handle(
  'execution:typeText',
  async (_, selector: string, text: string) => typeTextService(selector, text)
)

ipcMain.handle(
  'execution:clickElement',
  async (_, selector: string) => await clickElementService(selector)
)
