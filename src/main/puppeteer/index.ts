import Puppeteer, { Browser, Page, TimeoutError } from 'puppeteer'

export class BrowserController {
  private static instance: BrowserController | null = null
  private browser: Browser | null = null
  private page: Page | null = null
  shouldStop: boolean = false
  abortController: AbortController | null = null

  constructor() {}

  static getInstance(): BrowserController {
    if (!BrowserController.instance) {
      BrowserController.instance = new BrowserController()
    }

    return BrowserController.instance
  }

  hasActivePage(): boolean {
    if (!this.browser || !this.page) return false

    return true
  }

  isBrowserRunning(): boolean {
    if (!this.browser) return false

    return true
  }

  async start() {
    this.shouldStop = false

    this.browser = await Puppeteer.launch({
      headless: false,
    })

    const pages = await this.browser.pages()

    if (pages.length > 0) {
      this.page = pages[0]
    } else {
      this.page = await this.browser.newPage()
    }

    this.abortController = new AbortController()

    this.page.setDefaultTimeout(30_000)

    // await this.runFlow()
  }

  async stop() {
    this.shouldStop = true

    if (this.browser) {
      this.abortController?.abort()
      await this.browser.close()
    }
  }

  async goToUrl(url: string, timeout = 30_000) {
    if (this.shouldStop) return

    if (!this.page || !this.browser || !this.abortController) {
      throw new Error(`Browser not found`)
    }

    await this.page.goto(url, {
      signal: this.abortController.signal,
      waitUntil: 'networkidle2',
      timeout,
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  async waitForElement({
    description = '',
    selector,
    timeout = 30_000,
    shouldBe,
  }: {
    description?: string
    selector: string
    timeout?: number
    shouldBe: 'visible' | 'hidden'
  }): Promise<void> {
    if (!this.page || !this.browser)
      throw new Error(`Browser or page not found`)

    try {
      await this.page.waitForSelector(selector, {
        timeout,
        signal: this.abortController?.signal,
        visible: shouldBe === 'visible' ? true : false,
        hidden: shouldBe === 'hidden' ? true : false,
      })
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new Error(
          `Timeout de ${timeout}ms atingido ao tentar executar: "${description}" no seletor "${selector}"`
        )
      }

      throw error
    }
  }

  async waitAndType({
    description = '',
    selector,
    text,
    timeout = 30_000,
  }: {
    description?: string
    selector: string
    text: string
    timeout?: number
  }): Promise<void> {
    if (!this.page || !this.browser)
      throw new Error(`Browser or page not found`)

    try {
      await this.page.waitForSelector(selector, {
        timeout,
        signal: this.abortController?.signal ?? undefined,
      })

      await this.page.type(selector, text)
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new Error(
          `Timeout de ${timeout}ms atingido ao tentar executar: "${description}" no seletor "${selector}"`
        )
      }

      throw error
    }
  }

  async waitAndClick({
    description = '',
    selector,
    timeout = 30_000,
  }: {
    description?: string
    selector: string
    timeout?: number
  }): Promise<void> {
    if (!this.page || !this.browser)
      throw new Error(`Browser or page not found`)

    try {
      await this.page.waitForSelector(selector, {
        timeout,
        signal: this.abortController?.signal || undefined,
      })

      await this.page.click(selector)
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new Error(
          `Timeout de ${timeout}ms atingido ao tentar executar: "${description}" no seletor "${selector}"`
        )
      }

      throw error
    }
  }
}
