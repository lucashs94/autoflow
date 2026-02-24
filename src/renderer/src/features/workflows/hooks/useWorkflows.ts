import { useIPCMutation } from '@renderer/lib/hooks/useIPCMutation'
import { useIPCQuery } from '@renderer/lib/hooks/useIPCQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { toast } from 'sonner'
import { executeWorkflow } from '../functions/executeWorkflow'

/**
 * Hook to fetch all workflows using suspense
 * @returns The list of workflows for the authenticated user.
 */
export const useWorkflows = () => {
  return useIPCQuery({
    queryKey: ['workflows'],
    queryFn: () => window.api.workflows.getMany(),
  })
}

/**
 * Hook get a single workflow
 * @returns a workflows with their nodes and edges
 */
export const useWorkflow = (workflowId: string) => {
  return useIPCQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => window.api.workflows.getOne(workflowId),
  })
}

/**
 * Hook to create new workflow
 */
export const useCreateWorkflow = () => {
  return useIPCMutation({
    mutationKey: ['create-workflow'],
    mutationFn: (name: string) => window.api.workflows.create(name),
    successMessage: 'Workflow created successfully!',
    errorMessage: 'Failed to create workflow!',
    invalidateQueries: [['workflows']],
  })
}

/**
 * Hook to remove a workflow
 */
export const useDeleteWorkflow = () => {
  return useIPCMutation({
    mutationKey: ['deleteWorkflow'],
    mutationFn: (workflowId: string) => window.api.workflows.delete(workflowId),
    successMessage: 'Workflow deleted successfully!',
    errorMessage: 'Failed to delete workflow!',
    invalidateQueries: [['workflows']],
  })
}

/**
 * Hook to update a workflow name
 */
export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient()

  return useIPCMutation({
    mutationKey: ['updateWorkflowName'],
    mutationFn: (params: { workflowId: string; name: string }) =>
      window.api.workflows.updateWorkflowName(params.workflowId, params.name),
    successMessage: 'Workflow name updated successfully!',
    errorMessage: 'Failed to update workflow name!',
    invalidateQueries: [],
    onSuccessCallback: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
    },
  })
}

/**
 * Hook to update a workflow
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient()

  return useIPCMutation({
    mutationKey: ['updateWorkflow'],
    mutationFn: (params: {
      workflowId: string
      nodes: Node[]
      edges: Edge[]
    }) =>
      window.api.workflows.updateWorkflow(
        params.workflowId,
        params.nodes,
        params.edges
      ),
    successMessage: 'Workflow updated successfully!',
    errorMessage: 'Failed to update workflow!',
    invalidateQueries: [],
    onSuccessCallback: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
    },
  })
}

/**
 * Hook to execute a workflow
 */
export const useExecuteWorkflow = () => {
  return useMutation({
    mutationFn: async ({
      workflowId,
      signal,
    }: {
      workflowId: string
      signal?: AbortSignal
    }) => await executeWorkflow(workflowId, signal),
    onSuccess: (_, variables) => {
      if (variables.signal?.aborted) return
      toast.success(`Workflow executed!`)
    },
    onError: (error, variables) => {
      if (variables.signal?.aborted) return
      toast.error(`Failed to execute workflow`, {
        description: error.message,
      })
    },
  })
}
