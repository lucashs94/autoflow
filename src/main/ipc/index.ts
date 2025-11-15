import { ipcMain } from 'electron'
import {
  createWorkflowService,
  getWorkflowService,
  getWorkflowsService,
  updateWorkflowNameService,
} from '../services/workflows'

ipcMain.handle('workflows:getMany', async () => getWorkflowsService())
ipcMain.handle('workflows:getOne', async (_, workflowId: string) =>
  getWorkflowService(workflowId)
)
ipcMain.handle('workflows:create', async (_, name: string) =>
  createWorkflowService(name)
)
ipcMain.handle(
  'workflows:updateName',
  async (_, workflowId: string, name: string) =>
    updateWorkflowNameService(workflowId, name)
)
