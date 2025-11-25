export const NodeType = {
  INITIAL: 'INITIAL',
  HTTP_REQUEST: 'HTTP_REQUEST',
  NAVIGATION: 'NAVIGATION',
} as const

export type NodeType = (typeof NodeType)[keyof typeof NodeType]
