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
        updateWorkflowName: (workflowId: string, name: string) => Promise<void>
        updateWorkflow: (
          workflowId: string,
          nodes: FlowNode[],
          edges: edgesServiceType[]
        ) => Promise<void>
      }
    }
  }
}
