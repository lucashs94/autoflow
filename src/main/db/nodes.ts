import { db } from '.'
import { NodeType } from './types'

export function updateNodeName(nodeId: string, data: string) {
  const now = Date.now()

  db.prepare('UPDATE nodes SET data = ?, updatedAt = ? WHERE id = ?').run(
    data,
    now,
    nodeId
  )
}

export function getNode(nodeId: string) {
  const node = db
    .prepare('SELECT * FROM nodes WHERE id = ?')
    .get(nodeId) as NodeType

  return node
}
