import Puppeteer, { Browser, Page } from 'puppeteer'

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
      defaultViewport: null,
      args: ['--start-maximized'],
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
      throw new Error(`Browser or page not found`)
    }

    await this.page.goto(url, {
      signal: this.abortController.signal,
      waitUntil: 'networkidle2',
      timeout,
    })
  }

  async waitForElement({
    selector,
    timeout,
    shouldBe,
  }: {
    selector: string
    timeout?: number
    shouldBe: 'visible' | 'hidden'
  }): Promise<void> {
    if (this.shouldStop) return

    if (!this.page || !this.browser || !this.abortController)
      throw new Error(`Browser or page not found`)

    const options: any = { signal: this.abortController.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    const locator = this.page.locator(selector)

    if (shouldBe === 'visible') {
      // Wait for element to be visible
      await locator.wait(options)
    } else {
      // Wait for element to be hidden
      // We use waitForFunction to check if element is not visible
      const timeoutMs = timeout ? timeout * 1000 : 30000

      await this.page.waitForFunction(
        (sel) => {
          // Check if selector is XPath
          if (sel.startsWith('xpath/')) {
            const xpath = sel.replace('xpath/', '')
            const result = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            )
            const element = result.singleNodeValue as HTMLElement
            if (!element) return true // Element doesn't exist = hidden
            const style = window.getComputedStyle(element)
            return style.display === 'none' || style.visibility === 'hidden' || element.offsetParent === null
          } else {
            // CSS selector
            const element = document.querySelector(sel)
            if (!element) return true // Element doesn't exist = hidden
            const style = window.getComputedStyle(element)
            return style.display === 'none' || style.visibility === 'hidden' || (element as HTMLElement).offsetParent === null
          }
        },
        { timeout: timeoutMs, signal: this.abortController.signal },
        selector
      )
    }
  }

  async waitAndType({
    selector,
    text,
    timeout,
  }: {
    selector: string
    text: string
    timeout?: number
  }): Promise<void> {
    if (this.shouldStop) return

    if (!this.page || !this.browser || !this.abortController)
      throw new Error(`Browser or page not found`)

    const options: any = { signal: this.abortController.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    await this.page.locator(selector).fill(text, options)
  }

  async waitAndClick({
    selector,
    timeout,
  }: {
    selector: string
    timeout?: number
  }): Promise<void> {
    if (this.shouldStop) return

    if (!this.page || !this.browser || !this.abortController)
      throw new Error(`Browser or page not found`)

    const options: any = { signal: this.abortController.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    await this.page.locator(selector).click(options)
  }

  async getText({
    selector,
    timeout,
  }: {
    selector: string
    timeout?: number
  }): Promise<string> {
    if (this.shouldStop) {
      throw new Error('Browser execution stopped')
    }

    if (!this.page || !this.browser || !this.abortController) {
      throw new Error('No active page to get text from')
    }

    try {
      const options: any = { signal: this.abortController.signal }
      if (timeout) {
        options.timeout = timeout * 1000
      }

      // Wait for element to be visible
      await this.page.locator(selector).wait(options)

      // Get text content using $eval
      const text = await this.page.$eval(selector, (el) => el.textContent || '')

      if (!text) {
        throw new Error(`Element "${selector}" has no text content`)
      }

      return text.trim()
    } catch (error: any) {
      throw new Error(
        `Failed to get text from element "${selector}": ${error.message}`
      )
    }
  }

  isReady(): boolean {
    return !!(this.browser && this.page && !this.shouldStop)
  }
}
