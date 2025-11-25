import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useNode = (nodeId: string) => {
  return useQuery({
    queryKey: ['nodes', nodeId],
    queryFn: () => window.api.nodes.getOne(nodeId),
  })
}

export const useUpdateNodeName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateNodeName'],
    mutationFn: (params: { nodeId: string; name: string }) =>
      window.api.nodes.updateNodeName(params.nodeId, params.name),
    onError: () => {
      toast.error('Erro ao atualizar nome do node!', {
        id: 'update-node-name',
      })
    },
    onSuccess: (_, { nodeId }) => {
      queryClient.invalidateQueries({
        queryKey: ['nodes', nodeId],
      })
    },
  })
}
