import Puppeteer, { Browser, Page } from 'puppeteer-core'
import { ensureChromeAvailable, type ProgressCallback } from './chromium'

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
    return this.isBrowserConnected() && this.page !== null
  }

  isBrowserRunning(): boolean {
    return this.isBrowserConnected()
  }

  /**
   * Ensure page is ready for operations, throw if not
   */
  private ensurePageReady(): void {
    if (this.shouldStop) {
      throw new Error('Browser execution was stopped')
    }

    if (!this.browser || !this.browser.connected) {
      throw new Error('Browser is not connected')
    }

    if (!this.page) {
      throw new Error('No active page')
    }

    if (!this.abortController) {
      throw new Error('No abort controller')
    }
  }

  /**
   * Check if browser is still connected
   */
  private isBrowserConnected(): boolean {
    return this.browser !== null && this.browser.connected
  }

  /**
   * Force close browser and clean up
   */
  private async forceCloseBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close()
      } catch {
        // Ignore errors during force close
      }
      this.browser = null
      this.page = null
    }
  }

  /**
   * Check if page is truly usable by testing an operation
   */
  private async isPageUsable(): Promise<boolean> {
    if (!this.page) return false

    try {
      if (this.page.isClosed()) {
        return false
      }

      // Try to get the URL - this will fail if frame is detached
      this.page.url()

      // Try evaluate - most reliable test
      await this.page.evaluate(() => document.readyState)
      return true
    } catch {
      return false
    }
  }

  async start(headless: boolean = false, onChromeDownloadProgress?: ProgressCallback) {
    this.shouldStop = false
    this.abortController = new AbortController()

    // If we have an existing browser, check if it's truly usable
    if (this.browser && this.browser.connected) {
      // First, check if current page reference is still usable
      const pageUsable = await this.isPageUsable()

      if (pageUsable) {
        return
      }

      // Current page not usable - try to find another usable page in the browser
      try {
        const pages = await this.browser.pages()

        // Try to find a usable page
        for (const page of pages) {
          try {
            if (!page.isClosed()) {
              await page.evaluate(() => true)
              this.page = page
              this.page.setDefaultTimeout(30_000)
              return
            }
          } catch {
            // This page is not usable, continue
          }
        }

        // No usable pages found - create a new one
        this.page = await this.browser.newPage()
        this.page.setDefaultTimeout(30_000)

        // Verify the new page works
        await this.page.evaluate(() => true)

        // Close ALL other pages to prevent tab accumulation
        const allPages = await this.browser.pages()
        for (const p of allPages) {
          if (p !== this.page) {
            try {
              await p.close()
            } catch {
              // Page might already be closed
            }
          }
        }

        return
      } catch {
        // Fall through to restart browser
      }
    }

    // Need to start fresh browser
    await this.forceCloseBrowser()

    // Get Chrome path, downloading if necessary
    const executablePath = await ensureChromeAvailable(onChromeDownloadProgress)

    this.browser = await Puppeteer.launch({
      executablePath,
      headless,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
    })

    // Set up disconnect handler
    this.browser.on('disconnected', () => {
      this.browser = null
      this.page = null
    })

    // Get the default page or create one
    const pages = await this.browser.pages()
    if (pages.length > 0) {
      this.page = pages[0]
    } else {
      this.page = await this.browser.newPage()
    }

    this.page.setDefaultTimeout(30_000)

    // Verify page works
    await this.page.evaluate(() => true)
  }

  async stop() {
    this.shouldStop = true

    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    if (this.browser) {
      try {
        await this.browser.close()
      } catch {
        // Ignore errors when closing
      }
      this.browser = null
      this.page = null
    }
  }

  async goToUrl(url: string, timeout = 30_000) {
    this.ensurePageReady()

    await this.page!.goto(url, {
      signal: this.abortController!.signal,
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
    this.ensurePageReady()

    const options: any = { signal: this.abortController!.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    const locator = this.page!.locator(selector)

    if (shouldBe === 'visible') {
      // Wait for element to be visible
      await locator.wait(options)
    } else {
      // Wait for element to be hidden
      // We use waitForFunction to check if element is not visible
      const timeoutMs = timeout ? timeout * 1000 : 30000

      await this.page!.waitForFunction(
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
        { timeout: timeoutMs, signal: this.abortController!.signal },
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
    this.ensurePageReady()

    const options: any = { signal: this.abortController!.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    await this.page!.locator(selector).fill(text, options)
  }

  async waitAndClick({
    selector,
    timeout,
  }: {
    selector: string
    timeout?: number
  }): Promise<void> {
    this.ensurePageReady()

    const options: any = { signal: this.abortController!.signal }
    if (timeout) {
      options.timeout = timeout * 1000
    }

    await this.page!.locator(selector).click(options)
  }

  async getText({
    selector,
    timeout,
  }: {
    selector: string
    timeout?: number
  }): Promise<string> {
    this.ensurePageReady()

    try {
      const options: any = { signal: this.abortController!.signal }
      if (timeout) {
        options.timeout = timeout * 1000
      }

      // Wait for element to be visible
      await this.page!.locator(selector).wait(options)

      // Get text content using $eval
      const text = await this.page!.$eval(selector, (el) => el.textContent || '')

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
    return this.isBrowserConnected() && this.page !== null && !this.shouldStop
  }

  async elementExists({
    selector,
    timeout,
  }: {
    selector: string
    timeout?: number
  }): Promise<boolean> {
    this.ensurePageReady()

    const timeoutMs = timeout ? timeout * 1000 : 5000

    try {
      // Try to wait for the element with a short timeout
      const options: any = {
        signal: this.abortController!.signal,
        timeout: timeoutMs,
      }

      await this.page!.locator(selector).wait(options)

      // If we get here, the element exists
      return true
    } catch (error: any) {
      // If timeout or element not found, element doesn't exist
      // Check if it's actually an abort signal
      if (error.name === 'AbortError' || this.abortController!.signal.aborted) {
        throw error // Re-throw abort errors
      }

      // Element not found within timeout
      return false
    }
  }

  async dragAndDrop({
    sourceSelector,
    targetSelector,
    timeout,
  }: {
    sourceSelector: string
    targetSelector: string
    timeout?: number
  }): Promise<void> {
    this.ensurePageReady()

    const timeoutMs = timeout ? timeout * 1000 : 30000

    try {
      // Wait for source element
      const sourceOptions: any = {
        signal: this.abortController!.signal,
        timeout: timeoutMs,
      }
      await this.page!.locator(sourceSelector).wait(sourceOptions)

      // Wait for target element
      await this.page!.locator(targetSelector).wait(sourceOptions)

      // Get source element
      const sourceElement = await this.page!.$(sourceSelector)
      if (!sourceElement) {
        throw new Error(`Source element not found: ${sourceSelector}`)
      }

      // Get target element
      const targetElement = await this.page!.$(targetSelector)
      if (!targetElement) {
        throw new Error(`Target element not found: ${targetSelector}`)
      }

      // Get bounding boxes
      const sourceBox = await sourceElement.boundingBox()
      const targetBox = await targetElement.boundingBox()

      if (!sourceBox) {
        throw new Error(`Could not get bounding box for source element`)
      }
      if (!targetBox) {
        throw new Error(`Could not get bounding box for target element`)
      }

      // Calculate center coordinates
      const startX = sourceBox.x + sourceBox.width / 2
      const startY = sourceBox.y + sourceBox.height / 2
      const endX = targetBox.x + targetBox.width / 2
      const endY = targetBox.y + targetBox.height / 2

      // Execute drag and drop
      await this.page!.mouse.dragAndDrop(
        { x: startX, y: startY },
        { x: endX, y: endY },
        { delay: 100 }
      )
    } catch (error: any) {
      if (error.name === 'AbortError' || this.abortController!.signal.aborted) {
        throw error
      }
      throw new Error(`Failed to drag and drop: ${error.message}`)
    }
  }
}
