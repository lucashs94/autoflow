import { createId } from '@paralleldrive/cuid2'
import { db } from '.'
import { EdgeType, NodeType, WorkflowType } from './types'

export function createWorkflow(name: string) {
  const workflowId = createId()
  const nodeId = createId()

  db.transaction(() => {
    db.prepare(`INSERT INTO workflows (id, name) VALUES (?, ?)`).run(
      workflowId,
      name
    )

    db.prepare(
      `INSERT INTO nodes (id, workflowId, name, type, position) VALUES (?, ?, ?, ?, ?)`
    ).run(
      nodeId,
      workflowId,
      'INITIAL',
      'INITIAL',
      JSON.stringify({ x: 0, y: 0 })
    )
  })()

  return { workflowId, nodeId, name }
}

export function updateWorkflowName(workflowId: string, name: string) {
  db.prepare('UPDATE workflows SET name = ? WHERE id = ?').run(name, workflowId)
}

export function getWorkflows() {
  return db.prepare('SELECT * FROM workflows').all() as WorkflowType[]
}

export function getWorkflow(workflowId: string) {
  const workflow = db
    .prepare('SELECT * FROM workflows WHERE id = ?')
    .get(workflowId) as WorkflowType
  const nodes = db
    .prepare('SELECT * FROM nodes WHERE workflowId = ?')
    .all(workflowId) as NodeType[]
  const edges = db
    .prepare('SELECT * FROM connections WHERE workflowId = ?')
    .all(workflowId) as EdgeType[]

  // transformar position e data para json
  nodes.forEach((node) => {
    node.position = JSON.parse(node.position)
    node.data = JSON.parse(node.data)
  })

  return { id: workflow.id, name: workflow.name, nodes, edges }
}
