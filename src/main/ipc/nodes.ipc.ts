import { ipcMain } from 'electron'
import {
  getNodeService,
  updateNodeNameService,
} from '../services/nodes.service'

ipcMain.handle('nodes:getOne', async (_, nodeId: string) =>
  getNodeService(nodeId)
)
ipcMain.handle('nodes:updateName', async (_, nodeId: string, name: string) =>
  updateNodeNameService(nodeId, name)
)
