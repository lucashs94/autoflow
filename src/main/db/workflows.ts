import { createId } from '@paralleldrive/cuid2'
import { db } from '.'
import {
  CreateEdgeType,
  CreateNodeType,
  EdgeType,
  NodeType,
  WorkflowType,
} from './types'

export function createWorkflow(name: string) {
  const workflowId = createId()
  const nodeId = createId()

  db.transaction(() => {
    const now = Date.now()

    db.prepare(
      `INSERT INTO workflows (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`
    ).run(workflowId, name, now, now)

    db.prepare(
      `INSERT INTO nodes (id, workflowId, type, position, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      nodeId,
      workflowId,
      'INITIAL',
      JSON.stringify({ x: 0, y: 0 }),
      now,
      now
    )
  })()

  return { workflowId, name }
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

  return { workflow, nodes, edges }
}

export function getWorkflows() {
  return db.prepare('SELECT * FROM workflows').all() as WorkflowType[]
}

export function updateWorkflow(
  workflowId: string,
  nodes: CreateNodeType[],
  edges: CreateEdgeType[]
) {
  db.transaction(() => {
    // delete old nodes and edges
    db.prepare('DELETE FROM connections WHERE workflowId = ?').run(workflowId)
    db.prepare('DELETE FROM nodes WHERE workflowId = ?').run(workflowId)

    const now = Date.now()

    // insert new nodes and edges
    nodes.forEach((node) => {
      db.prepare(
        `INSERT INTO nodes (id, workflowId, type, position, data, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
          workflowId=excluded.workflowId,
          type=excluded.type,
          position=excluded.position,
          data=excluded.data,
          updatedAt=excluded.updatedAt
        `
      ).run(node.id, workflowId, node.type, node.position, node.data, now, now)
    })

    edges.forEach((edge) => {
      db.prepare(
        `INSERT INTO connections (id, workflowId, fromNodeId, toNodeId, fromOutput, toInput, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          workflowId=excluded.workflowId,
          fromNodeId=excluded.fromNodeId,
          toNodeId=excluded.toNodeId,
          fromOutput=excluded.fromOutput,
          toInput=excluded.toInput,
          updatedAt=excluded.updatedAt
        `
      ).run(
        edge.id,
        workflowId,
        edge.fromNodeId,
        edge.toNodeId,
        edge.fromOutput,
        edge.toInput,
        now,
        now
      )
    })

    db.prepare('UPDATE workflows SET updatedAt = ? WHERE id = ?').run(
      now,
      workflowId
    )
  })()
}

export function updateWorkflowName(workflowId: string, name: string) {
  const now = Date.now()
  db.prepare('UPDATE workflows SET name = ?, updatedAt = ? WHERE id = ?').run(
    name,
    now,
    workflowId
  )
}

export function deleteWorkflow(workflowId: string) {
  db.transaction(() => {
    // delete old nodes, edges and workflow
    db.prepare('DELETE FROM connections WHERE workflowId = ?').run(workflowId)
    db.prepare('DELETE FROM nodes WHERE workflowId = ?').run(workflowId)
    db.prepare('DELETE FROM workflows WHERE id = ?').run(workflowId)
  })()
}
