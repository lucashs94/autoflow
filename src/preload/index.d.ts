import { ElectronAPI } from '@electron-toolkit/preload'
import type { Node as FlowNode } from '@xyflow/react'
import type { IPCResult } from '../shared/@types/ipc-response'
import type { WorkflowServiceReturnType } from '../main/@types/workflows'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      workflows: {
        getMany: () => Promise<IPCResult<WorkflowType[]>>
        getOne: (workflowId: string) => Promise<IPCResult<WorkflowServiceReturnType>>
        create: (name: string) => Promise<IPCResult<{ workflowId: string; name: string }>>
        delete: (workflowId: string) => Promise<IPCResult<void>>
        updateWorkflowName: (workflowId: string, name: string) => Promise<IPCResult<void>>
        updateWorkflow: (
          workflowId: string,
          nodes: FlowNode[],
          edges: edgesServiceType[]
        ) => Promise<IPCResult<void>>
      }
      nodes: {
        getOne: (nodeId: string) => Promise<IPCResult<NodeType>>
        updateNodeName: (nodeId: string, name: string) => Promise<IPCResult<void>>
      }
      executions: {
        navigateUrl: (url: string) => Promise<IPCResult<void>>
        typeText: (selector: string, text: string, timeout?: number) => Promise<IPCResult<void>>
        clickElement: (selector: string, timeout?: number) => Promise<IPCResult<void>>
        waitForElement: (
          selector: string,
          shouldBe: 'visible' | 'hidden',
          timeout?: number
        ) => Promise<IPCResult<void>>
        abort: () => Promise<void>
      }
      history: {
        createExecution: (params: {
          id: string
          workflow_id: string
          workflow_name: string
          started_at: number
          status: 'running'
        }) => Promise<IPCResult<void>>
        finishExecution: (params: {
          id: string
          finished_at: number
          duration: number
          status: 'success' | 'failed' | 'cancelled'
          final_context: Record<string, unknown>
          error?: string
        }) => Promise<IPCResult<void>>
        logNodeExecution: (params: {
          id: string
          execution_id: string
          node_id: string
          node_name: string
          node_type: string
          status: 'loading' | 'success' | 'error' | 'cancelled'
          started_at: number
          finished_at?: number
          duration?: number
          context_snapshot: Record<string, unknown>
          error?: string
        }) => Promise<IPCResult<void>>
        getAllExecutions: (limit?: number) => Promise<IPCResult<any[]>>
        getExecutionById: (id: string) => Promise<IPCResult<any>>
        getNodeLogsByExecution: (executionId: string) => Promise<IPCResult<any[]>>
        getExecutionsByWorkflow: (workflowId: string) => Promise<IPCResult<any[]>>
        getWorkflowStats: (workflowId: string) => Promise<IPCResult<any>>
      }
    }
  }
}
