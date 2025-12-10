import { BrowserController } from '../puppeteer'

const instance = BrowserController.getInstance()

export async function navigateUrlService(url: string) {
  try {
    await instance.start()
    await instance.goToUrl(url)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function typeTextService(selector: string, text: string) {
  try {
    await instance.waitAndType({ selector, text })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function clickElementService(selector: string) {
  try {
    await instance.waitAndClick({ selector })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function waitForElementService(
  selector: string,
  shouldBe: 'visible' | 'hidden',
  timeout?: number
) {
  try {
    await instance.waitForElement({ selector, shouldBe, timeout })
  } catch (error) {
    console.log(error)
    throw error
  }
}
