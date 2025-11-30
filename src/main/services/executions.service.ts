import { BrowserController } from '../puppeteer'

const instance = BrowserController.getInstance()

export async function navigateUrlService(url) {
  try {
    await instance.start()
    await instance.goToUrl(url)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export function typeTextService(selector: string, text: string) {
  // Verifica se tem page ativa
  // Find element and type
}

export function clickElementService(selector) {
  // Verifica se tem page ativa
  // Find element and click
}
