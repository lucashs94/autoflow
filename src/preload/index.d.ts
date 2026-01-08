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
        typeText: (selector: string, text: string) => Promise<IPCResult<void>>
        clickElement: (selector: string) => Promise<IPCResult<void>>
        waitForElement: (
          selector: string,
          shouldBe: 'visible' | 'hidden',
          timeout?: number
        ) => Promise<IPCResult<void>>
      }
    }
  }
}
