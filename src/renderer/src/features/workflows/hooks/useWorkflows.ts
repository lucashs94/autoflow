import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { toast } from 'sonner'
import { executeWorkflow } from '../functions/executeWorkflow'

/**
 * Hook to fetch all workflows using suspense
 * @returns The list of workflows for the authenticated user.
 */
export const useWorkflows = () => {
  return useSuspenseQuery({
    queryKey: ['workflows'],
    queryFn: () => window.api.workflows.getMany(),
  })
}

/**
 * Hook get a single workflow
 * * @returns a workflows with their nodes and edges
 */
export const useWorkflow = (workflowId: string) => {
  return useSuspenseQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => window.api.workflows.getOne(workflowId),
  })
}

/**
 * Hook to create new workflow
 */
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createWorkflow'],
    mutationFn: (name: string) => window.api.workflows.create(name),
    onError: () => {
      toast.error('Erro ao criar workflow!', { id: 'create-workflow' })
    },
    onSuccess: () => {
      toast.success('Workflow criado com sucesso!', { id: 'create-workflow' })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

/**
 * Hook to remove a workflow
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteWorkflow'],
    mutationFn: (workflowId: string) => window.api.workflows.delete(workflowId),
    onError: (error) => {
      console.log(error)

      toast.error('Erro ao excluir workflow!', {
        id: 'delete-workflow',
      })
    },
    onSuccess: () => {
      toast.success('Workflow excluído com sucesso!', {
        id: 'delete-workflow',
      })
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      })
    },
  })
}

/**
 * Hook to update a workflow name
 */
export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateWorkflowName'],
    mutationFn: (params: { workflowId: string; name: string }) =>
      window.api.workflows.updateWorkflowName(params.workflowId, params.name),
    onError: () => {
      toast.error('Erro ao atualizar nome do workflow!', {
        id: 'update-workflow-name',
      })
    },
    onSuccess: (_, { workflowId }) => {
      toast.success('Workflow atualizado com sucesso!', {
        id: 'update-workflow-name',
      })
      queryClient.invalidateQueries({
        queryKey: ['workflow', workflowId],
      })
    },
  })
}

/**
 * Hook to update a workflow
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient()

  return useMutation({
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
    onError: () => {
      toast.error('Erro ao atualizar workflow!', { id: 'update-workflow' })
    },
    onSuccess: (_, { workflowId }) => {
      toast.success('Workflow atualizado com sucesso!', {
        id: 'update-workflow',
      })
      queryClient.invalidateQueries({
        queryKey: ['workflow', workflowId],
      })
    },
  })
}

/**
 * Hook to execute a workflow
 */
export const useExecuteWorkflow = () => {
  return useMutation({
    mutationFn: async (workflowId: string) => await executeWorkflow(workflowId),
    onSuccess: () => {
      toast.success(`Workflow executed!`)
    },
    onError: (error) => {
      toast.error(`Failed to execute workflow`, {
        description: error.message,
      })
    },
  })
}
