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
  text: string,
  timeout?: number
): Promise<IPCResult<void>> {
  try {
    await instance.waitAndType({ selector, text, timeout })
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}

export async function clickElementService(
  selector: string,
  timeout?: number
): Promise<IPCResult<void>> {
  try {
    await instance.waitAndClick({ selector, timeout })
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
