import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isSuccess } from '@shared/@types/ipc-response'
import { useIPCMutation } from '@renderer/lib/hooks/useIPCMutation'

export const useNode = (nodeId: string) => {
  return useQuery({
    queryKey: ['nodes', nodeId],
    queryFn: async () => {
      const result = await window.api.nodes.getOne(nodeId)

      if (!isSuccess(result)) {
        throw new Error(result.error.message)
      }

      return result.data
    },
  })
}

export const useUpdateNodeName = () => {
  const queryClient = useQueryClient()

  return useIPCMutation({
    mutationKey: ['updateNodeName'],
    mutationFn: (params: { nodeId: string; name: string }) =>
      window.api.nodes.updateNodeName(params.nodeId, params.name),
    successMessage: 'Node name updated successfully!',
    errorMessage: 'Failed to update node name!',
    invalidateQueries: [],
    onSuccessCallback: (_, { nodeId }) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', nodeId] })
    },
  })
}
