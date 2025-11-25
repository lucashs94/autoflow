export const NodeType = {
  INITIAL: 'INITIAL',
  HTTP_REQUEST: 'HTTP_REQUEST',
  NAVIGATION: 'NAVIGATION',
  WAIT_FOR_ELEMENT: 'WAIT_FOR_ELEMENT',
} as const

export type NodeType = (typeof NodeType)[keyof typeof NodeType]
