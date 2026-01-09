import { ipcMain } from 'electron'
import {
  createExecutionService,
  finishExecutionService,
  logNodeExecutionService,
  getAllExecutionsService,
  getExecutionByIdService,
  getNodeLogsByExecutionService,
  getExecutionsByWorkflowService,
  getWorkflowStatsService,
} from '../services/history.service'
import type {
  CreateExecutionParams,
  FinishExecutionParams,
  LogNodeExecutionParams,
} from '../db/history'

// Create execution
ipcMain.handle(
  'history:createExecution',
  async (_, params: CreateExecutionParams) => createExecutionService(params)
)

// Finish execution
ipcMain.handle(
  'history:finishExecution',
  async (_, params: FinishExecutionParams) => finishExecutionService(params)
)

// Log node execution
ipcMain.handle(
  'history:logNodeExecution',
  async (_, params: LogNodeExecutionParams) => logNodeExecutionService(params)
)

// Get all executions
ipcMain.handle('history:getAllExecutions', async (_, limit?: number) =>
  getAllExecutionsService(limit)
)

// Get execution by ID
ipcMain.handle('history:getExecutionById', async (_, id: string) =>
  getExecutionByIdService(id)
)

// Get node logs by execution
ipcMain.handle('history:getNodeLogsByExecution', async (_, executionId: string) =>
  getNodeLogsByExecutionService(executionId)
)

// Get executions by workflow
ipcMain.handle('history:getExecutionsByWorkflow', async (_, workflowId: string) =>
  getExecutionsByWorkflowService(workflowId)
)

// Get workflow stats
ipcMain.handle('history:getWorkflowStats', async (_, workflowId: string) =>
  getWorkflowStatsService(workflowId)
)
