import { ipcMain } from 'electron'
import {
  clickElementService,
  navigateUrlService,
  typeTextService,
  waitForElementService,
  getTextService,
} from '../services/executions.service'
import { BrowserController } from '../puppeteer'

ipcMain.handle('execution:navigateUrl', async (_, url: string) =>
  navigateUrlService(url)
)

ipcMain.handle(
  'execution:typeText',
  async (_, selector: string, text: string, timeout?: number) =>
    typeTextService(selector, text, timeout)
)

ipcMain.handle(
  'execution:clickElement',
  async (_, selector: string, timeout?: number) => await clickElementService(selector, timeout)
)

ipcMain.handle(
  'execution:waitForElement',
  async (_, selector: string, shouldBe: 'visible' | 'hidden', timeout?: number) =>
    await waitForElementService(selector, shouldBe, timeout)
)

ipcMain.handle(
  'execution:getText',
  async (_, selector: string, timeout?: number) => await getTextService(selector, timeout)
)

// Abort current browser operations (not close browser, just cancel in-flight operations)
ipcMain.handle('execution:abort', async () => {
  const instance = BrowserController.getInstance()
  instance.shouldStop = true
  instance.abortController?.abort()
})
