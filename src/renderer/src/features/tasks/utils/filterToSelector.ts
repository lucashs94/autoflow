import {
  AttributeOperator,
  ElementFilter,
  isAttributeFilter,
  isPositionFilter,
  isTextFilter,
  PositionOperator,
  TextOperator,
  validateFilter,
} from '../types/filters'

/**
 * Escapes special characters in strings for use in CSS selectors
 */
function escapeString(str: string): string {
  // Escape single quotes and backslashes
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/**
 * Converts a text filter to Puppeteer selector syntax
 */
function textFilterToSelector(filter: ElementFilter): string {
  if (!isTextFilter(filter)) return ''

  const escapedValue = escapeString(filter.value)

  switch (filter.operator) {
    case TextOperator.CONTAINS:
      return `:has-text('${escapedValue}')`
    case TextOperator.EQUALS:
      return `:text('${escapedValue}')`
    case TextOperator.STARTS_WITH:
      return `:has-text(/^${escapedValue}/)`
    case TextOperator.ENDS_WITH:
      return `:has-text(/${escapedValue}$/)`
    default:
      return ''
  }
}

/**
 * Converts a position filter to Puppeteer selector syntax
 */
function positionFilterToSelector(filter: ElementFilter): string {
  if (!isPositionFilter(filter)) return ''

  switch (filter.operator) {
    case PositionOperator.FIRST:
      return ':first'
    case PositionOperator.LAST:
      return ':last'
    case PositionOperator.NTH:
      return `:nth(${filter.value ?? 0})`
    default:
      return ''
  }
}

/**
 * Converts an attribute filter to Puppeteer selector syntax
 */
function attributeFilterToSelector(filter: ElementFilter): string {
  if (!isAttributeFilter(filter)) return ''

  const attrName = filter.attributeName

  switch (filter.operator) {
    case AttributeOperator.EXISTS:
      return `[${attrName}]`
    case AttributeOperator.EQUALS:
      return `[${attrName}='${escapeString(filter.value ?? '')}']`
    case AttributeOperator.CONTAINS:
      return `[${attrName}*='${escapeString(filter.value ?? '')}']`
    default:
      return ''
  }
}

/**
 * Sorts filters so that position filters come last (required by Puppeteer)
 */
function sortFilters(filters: ElementFilter[]): ElementFilter[] {
  const positionFilters = filters.filter(isPositionFilter)
  const otherFilters = filters.filter((f) => !isPositionFilter(f))
  return [...otherFilters, ...positionFilters]
}

/**
 * Converts an array of filters to a complete Puppeteer selector
 * @param baseSelector The base CSS selector (e.g., "button", "input[type='text']")
 * @param filters Array of filters to apply
 * @returns Enhanced selector with filters applied
 * @throws Error if any filter is invalid
 */
export function filtersToSelector(
  baseSelector: string,
  filters: ElementFilter[]
): string {
  if (!baseSelector || baseSelector.trim() === '') {
    throw new Error('Base selector is required')
  }

  if (!filters || filters.length === 0) {
    return baseSelector
  }

  // Validate all filters
  for (const filter of filters) {
    const validation = validateFilter(filter)
    if (!validation.valid) {
      throw new Error(`Invalid filter: ${validation.error}`)
    }
  }

  // Sort filters (position filters must be last)
  const sortedFilters = sortFilters(filters)

  // Convert each filter to selector syntax
  const filterSelectors = sortedFilters.map((filter) => {
    if (isTextFilter(filter)) {
      return textFilterToSelector(filter)
    }
    if (isPositionFilter(filter)) {
      return positionFilterToSelector(filter)
    }
    if (isAttributeFilter(filter)) {
      return attributeFilterToSelector(filter)
    }
    return ''
  })

  // Combine base selector with filter selectors
  const enhancedSelector = baseSelector + filterSelectors.join('')

  return enhancedSelector
}
