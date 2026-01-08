import { getNode, updateNodeName } from '../db/nodes'
import {
  IPCResult,
  success,
  errorFromException,
  IPCErrorCode,
  IPCOperationError,
} from '../../shared/@types/ipc-response'
import type { NodeType } from '../db/types'

export function getNodeService(nodeId: string): IPCResult<NodeType> {
  try {
    const node = getNode(nodeId)

    if (!node) {
      throw new IPCOperationError(
        IPCErrorCode.NODE_NOT_FOUND,
        `Node with id ${nodeId} not found`,
        { nodeId }
      )
    }

    node.data = JSON.parse(node.data)
    node.position = JSON.parse(node.position)

    return success(node)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}

export function updateNodeNameService(nodeId: string, name: string): IPCResult<void> {
  try {
    const node = getNode(nodeId)

    if (!node) {
      throw new IPCOperationError(
        IPCErrorCode.NODE_NOT_FOUND,
        `Node with id ${nodeId} not found`,
        { nodeId }
      )
    }

    const data = JSON.parse(node.data)
    data.name = name
    const stringData = JSON.stringify(data)

    updateNodeName(nodeId, stringData)

    return success(undefined)
  } catch (err) {
    return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
  }
}
