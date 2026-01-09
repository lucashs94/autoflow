// Filter Type Enums
export enum FilterType {
  TEXT = 'TEXT',
  POSITION = 'POSITION',
  ATTRIBUTE = 'ATTRIBUTE',
}

// Text Filter Operators
export enum TextOperator {
  CONTAINS = 'CONTAINS',
  EQUALS = 'EQUALS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

// Position Filter Operators
export enum PositionOperator {
  NTH = 'NTH',
  FIRST = 'FIRST',
  LAST = 'LAST',
}

// Attribute Filter Operators
export enum AttributeOperator {
  EQUALS = 'EQUALS',
  CONTAINS = 'CONTAINS',
  EXISTS = 'EXISTS',
}

// Filter Types (Discriminated Unions)
export interface TextFilter {
  type: FilterType.TEXT
  operator: TextOperator
  value: string
}

export interface PositionFilter {
  type: FilterType.POSITION
  operator: PositionOperator
  value?: number // Only required for NTH operator
}

export interface AttributeFilter {
  type: FilterType.ATTRIBUTE
  attributeName: string
  operator: AttributeOperator
  value?: string // Not required for EXISTS operator
}

// Union Type
export type ElementFilter = TextFilter | PositionFilter | AttributeFilter

// Type Guards
export function isTextFilter(filter: ElementFilter): filter is TextFilter {
  return filter.type === FilterType.TEXT
}

export function isPositionFilter(filter: ElementFilter): filter is PositionFilter {
  return filter.type === FilterType.POSITION
}

export function isAttributeFilter(filter: ElementFilter): filter is AttributeFilter {
  return filter.type === FilterType.ATTRIBUTE
}

// Validation Function
export function validateFilter(filter: ElementFilter): {
  valid: boolean
  error?: string
} {
  if (isTextFilter(filter)) {
    if (!filter.value || filter.value.trim() === '') {
      return { valid: false, error: 'Text value is required' }
    }
    return { valid: true }
  }

  if (isPositionFilter(filter)) {
    if (filter.operator === PositionOperator.NTH) {
      if (filter.value === undefined || filter.value < 0) {
        return { valid: false, error: 'Position index must be >= 0 for NTH operator' }
      }
    }
    return { valid: true }
  }

  if (isAttributeFilter(filter)) {
    if (!filter.attributeName || filter.attributeName.trim() === '') {
      return { valid: false, error: 'Attribute name is required' }
    }
    if (filter.operator !== AttributeOperator.EXISTS) {
      if (!filter.value || filter.value.trim() === '') {
        return { valid: false, error: 'Attribute value is required for EQUALS and CONTAINS operators' }
      }
    }
    return { valid: true }
  }

  return { valid: false, error: 'Unknown filter type' }
}
