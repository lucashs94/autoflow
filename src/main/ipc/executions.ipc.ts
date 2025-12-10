import { ipcMain } from 'electron'
import {
  clickElementService,
  navigateUrlService,
  typeTextService,
  waitForElementService,
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

ipcMain.handle(
  'execution:waitForElement',
  async (_, selector: string, shouldBe: 'visible' | 'hidden', timeout?: number) =>
    await waitForElementService(selector, shouldBe, timeout)
)
