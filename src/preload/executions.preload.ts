import { ipcRenderer } from 'electron'

export const executions = {
  navigateUrl: (url: string) =>
    ipcRenderer.invoke('execution:navigateUrl', url),
  typeText: (selector: string, text: string) =>
    ipcRenderer.invoke('execution:typeText', selector, text),
  clickElement: (selector: string) =>
    ipcRenderer.invoke('execution:clickElement', selector),
  waitForElement: (selector: string, shouldBe: 'visible' | 'hidden', timeout?: number) =>
    ipcRenderer.invoke('execution:waitForElement', selector, shouldBe, timeout),
}
