import { BrowserController } from '../puppeteer'
import {
  IPCResult,
  success,
  errorFromException,
  IPCErrorCode,
} from '../../shared/@types/ipc-response'

const instance = BrowserController.getInstance()

export async function navigateUrlService(url: string): Promise<IPCResult<void>> {
  try {
    await instance.start()
    await instance.goToUrl(url)
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.NAVIGATION_ERROR)
  }
}

export async function typeTextService(
  selector: string,
  text: string
): Promise<IPCResult<void>> {
  try {
    await instance.waitAndType({ selector, text })
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}

export async function clickElementService(selector: string): Promise<IPCResult<void>> {
  try {
    await instance.waitAndClick({ selector })
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}

export async function waitForElementService(
  selector: string,
  shouldBe: 'visible' | 'hidden',
  timeout?: number
): Promise<IPCResult<void>> {
  try {
    await instance.waitForElement({ selector, shouldBe, timeout })
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.TIMEOUT_ERROR)
  }
}
