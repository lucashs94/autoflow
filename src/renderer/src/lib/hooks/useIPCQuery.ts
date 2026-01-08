import type { IPCResult } from '@shared/@types/ipc-response'
import { isSuccess } from '@shared/@types/ipc-response'
import {
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query'

/**
 * Configuration for IPC queries
 *
 * Provides a declarative interface for defining IPC queries with automatic
 * error handling and IPCResult unwrapping.
 */
interface IPCQueryConfig<TData> {
  /** Unique key for the query (used for React Query cache) */
  queryKey: string[]

  /** The IPC function to call (must return IPCResult) */
  queryFn: () => Promise<IPCResult<TData>>

  /** Additional React Query options (optional) */
  options?: Omit<UseSuspenseQueryOptions<TData>, 'queryKey' | 'queryFn'>
}

/**
 * Custom hook that wraps useSuspenseQuery with IPC error handling
 *
 * This hook automatically:
 * - Unwraps IPCResult and checks for errors
 * - Throws errors to trigger React Query's error boundary
 * - Returns unwrapped data for direct use
 *
 * @param config - Configuration object for the query
 * @returns React Query suspense query result with unwrapped data
 *
 * @example
 * ```typescript
 * export const useWorkflows = () => {
 *   return useIPCQuery({
 *     queryKey: ['workflows'],
 *     queryFn: () => window.api.workflows.getMany(),
 *   })
 * }
 *
 * // Usage in component (with Suspense boundary)
 * function WorkflowsList() {
 *   const { data: workflows } = useWorkflows()
 *   return <div>{workflows.map(w => <div key={w.id}>{w.name}</div>)}</div>
 * }
 * ```
 */
export function useIPCQuery<TData>({
  queryKey,
  queryFn,
  options,
}: IPCQueryConfig<TData>): UseSuspenseQueryResult<TData> {
  return useSuspenseQuery({
    queryKey,
    queryFn: async (): Promise<TData> => {
      // Call the IPC function
      const result = await queryFn()

      // Check if the operation was successful
      if (!isSuccess(result)) {
        // Create error object with additional context
        const error = new Error(result.error.message)

        // Attach additional error details for debugging
        Object.assign(error, {
          code: result.error.code,
          details: result.error.details,
        })

        // Throw error to trigger React Query's error boundary
        throw error
      }

      // Return the unwrapped data
      return result.data
    },
    ...options,
  })
}
