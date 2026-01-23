import Database, {
  type Database as BetterSqlite3Database,
} from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const folderPath = path.join(app.getPath('userData'), 'database')

// Cria o arquivo se não existir
if (!fs.existsSync(folderPath)) {
  console.log('📦 Criando banco SQLite...')
  fs.mkdirSync(folderPath)
}

const dbPath = path.join(folderPath, 'app.db')

export const db: BetterSqlite3Database = new Database(dbPath)

console.log('🚀 Inicializando tabelas...')

db.exec(
  `
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      headless INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      workflowId TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'INITIAL',
      position TEXT NOT NULL,
      data TEXT DEFAULT '{}',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      workflowId TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
      fromNodeId TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      toNodeId TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      fromOutput TEXT NOT NULL DEFAULT 'main',
      toInput    TEXT NOT NULL DEFAULT 'main',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS execution_history (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      workflow_name TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      duration INTEGER,
      status TEXT CHECK(status IN ('running', 'success', 'failed', 'cancelled')) NOT NULL,
      final_context TEXT,
      error TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS node_execution_log (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      node_name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      status TEXT CHECK(status IN ('loading', 'success', 'error', 'cancelled')) NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      duration INTEGER,
      context_snapshot TEXT,
      error TEXT,
      FOREIGN KEY (execution_id) REFERENCES execution_history(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_execution_workflow ON execution_history(workflow_id, started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_node_execution ON node_execution_log(execution_id, started_at);
  `
)

// Migration: Add headless column to workflows table if it doesn't exist
try {
  const tableInfo = db.prepare('PRAGMA table_info(workflows)').all() as Array<{ name: string }>
  const hasHeadless = tableInfo.some((col) => col.name === 'headless')

  if (!hasHeadless) {
    console.log('🔄 Running migration: Adding headless column to workflows...')
    db.exec('ALTER TABLE workflows ADD COLUMN headless INTEGER NOT NULL DEFAULT 1')
    console.log('✔ Migration completed.')
  }
} catch (err) {
  console.error('Migration error:', err)
}

// Migration: Add error_code column to node_execution_log table if it doesn't exist
try {
  const nodeLogTableInfo = db.prepare('PRAGMA table_info(node_execution_log)').all() as Array<{ name: string }>
  const hasErrorCode = nodeLogTableInfo.some((col) => col.name === 'error_code')

  if (!hasErrorCode) {
    console.log('🔄 Running migration: Adding error_code column to node_execution_log...')
    db.exec('ALTER TABLE node_execution_log ADD COLUMN error_code TEXT')
    console.log('✔ Migration completed.')
  }
} catch (err) {
  console.error('Migration error:', err)
}

console.log('✔ Banco inicializado.')
