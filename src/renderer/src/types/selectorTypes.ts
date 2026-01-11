export enum SelectorType {
  CSS = 'css',
  XPATH = 'xpath',
}

export const SelectorTypeLabels: Record<SelectorType, string> = {
  [SelectorType.CSS]: 'CSS',
  [SelectorType.XPATH]: 'XPath',
}

export const SelectorTypePlaceholders: Record<SelectorType, string> = {
  [SelectorType.CSS]: 'e.g., .button-class, #element-id',
  [SelectorType.XPATH]: 'e.g., //button[@class="submit"]',
}

export const SelectorTypeDescriptions: Record<SelectorType, string> = {
  [SelectorType.CSS]: 'Use classes (.class-name) or IDs (#element-id)',
  [SelectorType.XPATH]: 'XML path for complex DOM navigation',
}

export const SelectorTypeExamples: Record<SelectorType, string[]> = {
  [SelectorType.CSS]: [
    '.submit-button',
    '#login-form',
    '.card.active',
    '#header .logo',
  ],
  [SelectorType.XPATH]: [
    '//button[@class="submit"]',
    '//div[@id="container"]//span',
    '//input[@type="text"][1]',
    '//*[contains(@class, "button")]',
  ],
}

export const SelectorTypeHelp: Record<SelectorType, string> = {
  [SelectorType.CSS]: `**CSS Selectors** use classes and IDs to find elements:\\
\\
**.class-name** - Elements with this class\\
**#element-id** - Element with this ID\\
**.parent .child** - Nested elements\\
**.class1.class2** - Multiple classes\\
\\
**Examples:**\\
.submit-button\\
#login-form\\
.modal .close-btn`,

  [SelectorType.XPATH]: `**XPath** allows complex queries using XML path:\\
\\
**//** - Search anywhere in document\\
**[@attribute="value"]** - Match attribute\\
**[position]** - Get element by position\\
**contains()** - Partial match\\
\\
**Examples:**\\
//button[@class="submit"]\\
//div[@id="header"]//a\\
//*[contains(text(), "Click")]`,
}

/**
 * Converts a selector to Puppeteer locator syntax
 */
export function formatSelectorForPuppeteer(
  selector: string,
  type: SelectorType = SelectorType.CSS
): string {
  const trimmedSelector = selector.trim()

  switch (type) {
    case SelectorType.CSS:
      return trimmedSelector
    case SelectorType.XPATH:
      return `xpath/${trimmedSelector}`
    default:
      return trimmedSelector
  }
}
