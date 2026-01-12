import { ipcRenderer } from 'electron'

export const executions = {
  navigateUrl: (url: string) =>
    ipcRenderer.invoke('execution:navigateUrl', url),
  typeText: (selector: string, text: string, timeout?: number) =>
    ipcRenderer.invoke('execution:typeText', selector, text, timeout),
  clickElement: (selector: string, timeout?: number) =>
    ipcRenderer.invoke('execution:clickElement', selector, timeout),
  waitForElement: (selector: string, shouldBe: 'visible' | 'hidden', timeout?: number) =>
    ipcRenderer.invoke('execution:waitForElement', selector, shouldBe, timeout),
  getText: (selector: string, timeout?: number) =>
    ipcRenderer.invoke('execution:getText', selector, timeout),
  abort: () =>
    ipcRenderer.invoke('execution:abort'),
}
