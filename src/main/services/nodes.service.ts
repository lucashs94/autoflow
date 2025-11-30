import { getNode, updateNodeName } from '../db/nodes'

export function getNodeService(nodeId: string) {
  const node = getNode(nodeId)

  if (!node) return

  node.data = JSON.parse(node.data)
  node.position = JSON.parse(node.position)

  return node
}

export function updateNodeNameService(nodeId: string, name: string) {
  const node = getNode(nodeId)

  if (!node) return

  const data = JSON.parse(node.data)
  data.name = name
  const stringData = JSON.stringify(data)

  return updateNodeName(nodeId, stringData)
}
