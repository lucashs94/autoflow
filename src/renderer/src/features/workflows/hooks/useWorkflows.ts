import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
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
