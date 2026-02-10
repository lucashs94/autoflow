import type { IPCResult } from '@shared/@types/ipc-response'
import { isSuccess } from '@shared/@types/ipc-response'
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Configuration for IPC mutations
 *
 * Provides a declarative interface for defining IPC mutations with automatic
 * error handling, toast notifications, and cache invalidation.
 */
interface IPCMutationConfig<TData, TVariables> {
  /** Unique key for the mutation (used for toast IDs and React Query cache) */
  mutationKey: string[]

  /** The IPC function to call (must return IPCResult) */
  mutationFn: (variables: TVariables) => Promise<IPCResult<TData>>

  /** Success message to display in toast (optional) */
  successMessage?: string

  /** Error message to display in toast (optional) */
  errorMessage?: string

  /** Array of query keys to invalidate on success (optional) */
  invalidateQueries?: string[][]

  /** Callback to run on successful mutation (optional) */
  onSuccessCallback?: (data: TData, variables: TVariables) => void
}

/**
 * Custom hook that wraps useMutation with IPC error handling
 *
 * This hook automatically:
 * - Unwraps IPCResult and checks for errors
 * - Throws errors for React Query's error handling
 * - Shows success/error toast notifications
 * - Invalidates specified query caches
 * - Runs custom success callbacks
 *
 * @param config - Configuration object for the mutation
 * @returns React Query mutation result
 *
 * @example
 * ```typescript
 * export const useCreateWorkflow = () => {
 *   return useIPCMutation({
 *     mutationKey: ['createWorkflow'],
 *     mutationFn: (name: string) => window.api.workflows.create(name),
 *     successMessage: 'Workflow created successfully!',
 *     errorMessage: 'Failed to create workflow!',
 *     invalidateQueries: [['workflows']],
 *   })
 * }
 *
 * // Usage in component
 * const { mutate } = useCreateWorkflow()
 * mutate('My Workflow')
 * ```
 */
export function useIPCMutation<TData, TVariables>({
  mutationKey,
  mutationFn,
  successMessage,
  errorMessage,
  invalidateQueries = [],
  onSuccessCallback,
}: IPCMutationConfig<TData, TVariables>): UseMutationResult<
  TData,
  Error,
  TVariables
> {
  const queryClient = useQueryClient()

  // Generate a stable toast ID from mutation key
  const toastId = mutationKey[0]

  return useMutation({
    mutationKey,
    mutationFn: async (variables: TVariables): Promise<TData> => {
      // Call the IPC function
      const result = await mutationFn(variables)

      // Check if the operation was successful
      if (!isSuccess(result)) {
        // Create error object that React Query can handle
        const error = new Error(result.error.message)

        // Attach additional error details for debugging
        Object.assign(error, {
          code: result.error.code,
          details: result.error.details,
        })

        // Throw error to trigger React Query's error handling
        throw error
      }

      // Return the unwrapped data
      return result.data
    },
    onError: (error: Error) => {
      // Show error toast if message is provided
      if (errorMessage) {
        toast.error(errorMessage, {
          id: toastId,
          description: error.message,
        })
      }
    },
    onSuccess: (data, variables) => {
      // Show success toast if message is provided
      if (successMessage) {
        toast.success(successMessage, {
          id: toastId,
        })
      }

      // Invalidate specified query caches
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      // Run custom success callback if provided
      onSuccessCallback?.(data, variables)
    },
  })
}
