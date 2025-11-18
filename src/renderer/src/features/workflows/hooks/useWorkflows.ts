import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { Edge, Node } from '@xyflow/react'
import { toast } from 'sonner'

export const useWorkflows = () => {
  return useSuspenseQuery({
    queryKey: ['workflows'],
    queryFn: () => window.api.workflows.getMany(),
  })
}

export const useWorkflow = (workflowId: string) => {
  return useSuspenseQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => window.api.workflows.getOne(workflowId),
  })
}

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
