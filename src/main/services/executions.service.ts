import { BrowserController } from '../puppeteer'
import {
  IPCResult,
  success,
  errorFromException,
  IPCErrorCode,
} from '../../shared/@types/ipc-response'

const instance = BrowserController.getInstance()

export async function startBrowserService(
  headless: boolean = false
): Promise<IPCResult<void>> {
  try {
    // Only start if not already running
    if (!instance.isBrowserRunning()) {
      await instance.start(headless)
    }
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.NAVIGATION_ERROR)
  }
}

export async function navigateUrlService(url: string, headless?: boolean): Promise<IPCResult<void>> {
  try {
    // Start browser if not already running
    if (!instance.isBrowserRunning()) {
      await instance.start(headless ?? false)
    }
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

export async function getTextService(
  selector: string,
  timeout?: number
): Promise<IPCResult<{ text: string }>> {
  try {
    const text = await instance.getText({ selector, timeout })
    return success({ text })
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}

export async function elementExistsService(
  selector: string,
  timeout?: number
): Promise<IPCResult<{ exists: boolean }>> {
  try {
    const exists = await instance.elementExists({ selector, timeout })
    return success({ exists })
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}

export async function dragAndDropService(
  sourceSelector: string,
  targetSelector: string,
  timeout?: number
): Promise<IPCResult<void>> {
  try {
    await instance.dragAndDrop({ sourceSelector, targetSelector, timeout })
    return success(undefined)
  } catch (error) {
    return errorFromException(error, IPCErrorCode.ELEMENT_NOT_FOUND)
  }
}
