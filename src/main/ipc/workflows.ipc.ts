import type { Node as FlowNode } from '@xyflow/react'
import { ipcMain } from 'electron'
import { edgesServiceType } from '../@types/workflows'
import {
  createWorkflowService,
  deleteWorkflowService,
  getWorkflowService,
  getWorkflowsService,
  updateWorkflowNameService,
  updateWorkflowService,
} from '../services/workflows.service'

ipcMain.handle('workflows:getMany', async () => getWorkflowsService())
ipcMain.handle('workflows:getOne', async (_, workflowId: string) =>
  getWorkflowService(workflowId)
)
ipcMain.handle('workflows:create', async (_, name: string) =>
  createWorkflowService(name)
)
ipcMain.handle('workflows:delete', async (_, workflowId: string) =>
  deleteWorkflowService(workflowId)
)
ipcMain.handle(
  'workflows:updateName',
  async (_, workflowId: string, name: string) =>
    updateWorkflowNameService(workflowId, name)
)
ipcMain.handle(
  'workflows:update',
  async (_, workflowId: string, nodes: FlowNode[], edges: edgesServiceType[]) =>
    updateWorkflowService(workflowId, nodes, edges)
)
