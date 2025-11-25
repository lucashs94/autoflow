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
  `
)

console.log('✔ Banco inicializado.')
