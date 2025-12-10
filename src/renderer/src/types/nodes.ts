export const NodeType = {
  INITIAL: 'INITIAL',
  HTTP_REQUEST: 'HTTP_REQUEST',
  NAVIGATION: 'NAVIGATION',
  WAIT_FOR_ELEMENT: 'WAIT_FOR_ELEMENT',
  WAIT_TIME: 'WAIT_TIME',
  TYPE_TEXT: 'TYPE_TEXT',
  CLICK_ELEMENT: 'CLICK_ELEMENT',
  SET_VARIABLES: 'SET_VARIABLES',
} as const

export type NodeType = (typeof NodeType)[keyof typeof NodeType]
