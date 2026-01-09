import Database, {
  type Database as BetterSqlite3Database,
} from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const folderPath = path.join(process.cwd(), 'database')

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

console.log('✔ Banco inicializado.')
