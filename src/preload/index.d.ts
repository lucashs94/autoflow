import { ElectronAPI } from '@electron-toolkit/preload'
import type { Node as FlowNode } from '@xyflow/react'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      workflows: {
        getMany: () => Promise<WorkflowType[]>
        getOne: (workflowId: string) => Promise<WorkflowReturnType>
        create: (name: string) => Promise<WorkflowType>
        delete: (workflowId: string) => Promise<void>
        updateWorkflowName: (workflowId: string, name: string) => Promise<void>
        updateWorkflow: (
          workflowId: string,
          nodes: FlowNode[],
          edges: edgesServiceType[]
        ) => Promise<void>
      }
      nodes: {
        getOne: (nodeId: string) => Promise<WorkflowReturnType>
        updateNodeName: (nodeId: string, name: string) => Promise<void>
      }
      executions: {
        navigateUrl: (url: string) => Promise<void>
        typeText: (selector: string, text: string) => Promise<void>
        clickElement: (selector: string) => Promise<void>
        waitForElement: (selector: string, shouldBe: 'visible' | 'hidden', timeout?: number) => Promise<void>
      }
    }
  }
}
