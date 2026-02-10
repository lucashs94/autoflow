import { getDb } from '.'
import { NodeType } from './types'

export function updateNodeName(nodeId: string, data: string) {
  const now = Date.now()

  getDb().prepare('UPDATE nodes SET data = ?, updatedAt = ? WHERE id = ?').run(
    data,
    now,
    nodeId
  )
}

export function getNode(nodeId: string) {
  const node = getDb()
    .prepare('SELECT * FROM nodes WHERE id = ?')
    .get(nodeId) as NodeType

  return node
}
