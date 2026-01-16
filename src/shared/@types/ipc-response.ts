/**
 * Standardized IPC Response Pattern
 *
 * This module provides a consistent response structure for all IPC communication
 * between the main and renderer processes. It implements the Result Type Pattern
 * using discriminated unions for type-safe error handling.
 *
 * SAFE FOR BOTH PROCESSES:
 * - This module contains only pure TypeScript types and utilities
 * - No Node.js dependencies
 * - No process-specific code
 * - Can be safely imported by both main and renderer processes
 */

/**
 * Error codes for IPC operations
 *
 * Categorized by domain for easier debugging and error handling
 */
export enum IPCErrorCode {
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Database errors
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

  // Browser automation errors
  BROWSER_NOT_STARTED = 'BROWSER_NOT_STARTED',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NAVIGATION_ERROR = 'NAVIGATION_ERROR',

  // Workflow execution errors
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  NODE_NOT_FOUND = 'NODE_NOT_FOUND',
  INVALID_WORKFLOW = 'INVALID_WORKFLOW',

  // Internal errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Structured error details for IPC responses
 *
 * Provides rich context for debugging and error handling
 */
export interface IPCErrorDetails {
  /** Error code for programmatic error handling */
  code: IPCErrorCode

  /** Human-readable error message */
  message: string

  /** Additional context about the error */
  details?: Record<string, unknown>

  /** Stack trace (only included in development mode) */
  stack?: string
}

/**
 * Success response wrapper
 *
 * Wraps successful operation results in a consistent structure
 */
export interface IPCSuccess<T> {
  success: true
  data: T
}

/**
 * Error response wrapper
 *
 * Wraps error information in a consistent structure
 */
export interface IPCError {
  success: false
  error: IPCErrorDetails
}

/**
 * Generic IPC Result type - discriminated union
 *
 * This type forces consumers to check the success flag before accessing data,
 * providing compile-time type safety for error handling.
 *
 * @example
 * ```typescript
 * const result: IPCResult<User> = await window.api.users.getOne(id)
 *
 * if (isSuccess(result)) {
 *   console.log(result.data.name) // TypeScript knows data exists
 * } else {
 *   console.error(result.error.message) // TypeScript knows error exists
 * }
 * ```
 */
export type IPCResult<T> = IPCSuccess<T> | IPCError

/**
 * Custom error class for IPC operations
 *
 * Used to throw typed errors within service functions that will be
 * converted to IPCError responses by the error handling utilities.
 *
 * @example
 * ```typescript
 * if (!user) {
 *   throw new IPCOperationError(
 *     IPCErrorCode.NOT_FOUND,
 *     'User not found',
 *     { userId }
 *   )
 * }
 * ```
 */
export class IPCOperationError extends Error {
  constructor(
    public code: IPCErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'IPCOperationError'

    // Maintains proper stack trace for where our error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IPCOperationError)
    }
  }
}

/**
 * Creates a successful IPC response
 *
 * @param data - The data to return to the renderer process
 * @returns A success response wrapper
 *
 * @example
 * ```typescript
 * export function getUserService(id: string): IPCResult<User> {
 *   const user = getUser(id)
 *   return success(user)
 * }
 * ```
 */
export function success<T>(data: T): IPCSuccess<T> {
  return {
    success: true,
    data,
  }
}

/**
 * Creates an error IPC response
 *
 * @param code - The error code from IPCErrorCode enum
 * @param message - Human-readable error message
 * @param details - Optional additional context about the error
 * @returns An error response wrapper
 *
 * @example
 * ```typescript
 * return error(
 *   IPCErrorCode.NOT_FOUND,
 *   'User not found',
 *   { userId: '123' }
 * )
 * ```
 */
export function error(
  code: IPCErrorCode,
  message: string,
  details?: Record<string, unknown>
): IPCError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      stack:
        process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
    },
  }
}

/**
 * Creates an error response from an Error object or unknown exception
 *
 * Handles both IPCOperationError (preserves code and details) and generic
 * Error objects (uses fallback code).
 *
 * @param err - The exception to convert
 * @param fallbackCode - Error code to use if exception is not an IPCOperationError
 * @returns An error response wrapper
 *
 * @example
 * ```typescript
 * try {
 *   const result = doSomething()
 *   return success(result)
 * } catch (err) {
 *   return errorFromException(err, IPCErrorCode.DATABASE_ERROR)
 * }
 * ```
 */
export function errorFromException(
  err: unknown,
  fallbackCode: IPCErrorCode = IPCErrorCode.UNKNOWN_ERROR
): IPCError {
  // Handle IPCOperationError - preserve code and details
  if (err instanceof IPCOperationError) {
    return error(err.code, err.message, err.details)
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    return error(fallbackCode, err.message, {
      originalError: err.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  }

  // Handle unknown error types
  return error(fallbackCode, 'An unknown error occurred', {
    error: String(err),
  })
}

/**
 * Wraps an async function to automatically catch errors and return IPCResult
 *
 * This is a convenience wrapper for IPC handlers that automatically converts
 * thrown errors into IPCError responses.
 *
 * @param handler - The async function to wrap
 * @param errorCode - Default error code for uncaught exceptions
 * @returns A wrapped function that always returns IPCResult
 *
 * @example
 * ```typescript
 * const safeGetUser = wrapIPCHandler(
 *   async (id: string) => {
 *     const user = await database.users.findOne(id)
 *     if (!user) throw new Error('Not found')
 *     return user
 *   },
 *   IPCErrorCode.DATABASE_ERROR
 * )
 *
 * // Usage
 * const result = await safeGetUser('123') // Returns IPCResult<User>
 * ```
 */
export function wrapIPCHandler<TArgs extends unknown[], TReturn>(
  handler: (...args: TArgs) => Promise<TReturn>,
  errorCode: IPCErrorCode = IPCErrorCode.UNKNOWN_ERROR
): (...args: TArgs) => Promise<IPCResult<TReturn>> {
  return async (...args: TArgs): Promise<IPCResult<TReturn>> => {
    try {
      const result = await handler(...args)
      return success(result)
    } catch (err) {
      return errorFromException(err, errorCode)
    }
  }
}

/**
 * Type guard to check if result is a success response
 *
 * @param result - The IPC result to check
 * @returns True if result is a success response
 *
 * @example
 * ```typescript
 * const result = await window.api.users.getOne(id)
 *
 * if (isSuccess(result)) {
 *   console.log(result.data) // TypeScript knows data exists
 * }
 * ```
 */
export function isSuccess<T>(result: IPCResult<T>): result is IPCSuccess<T> {
  return result.success === true
}

/**
 * Type guard to check if result is an error response
 *
 * @param result - The IPC result to check
 * @returns True if result is an error response
 *
 * @example
 * ```typescript
 * const result = await window.api.users.getOne(id)
 *
 * if (isError(result)) {
 *   console.error(result.error.message) // TypeScript knows error exists
 * }
 * ```
 */
export function isError<T>(result: IPCResult<T>): result is IPCError {
  return result.success === false
}

/**
 * Error class for executor/workflow errors with typed error codes
 *
 * Used by executors to throw errors that preserve the IPC error code
 * for categorization and display in the UI.
 *
 * @example
 * ```typescript
 * if (!isSuccess(result)) {
 *   throw ExecutorError.fromIPCError(result.error)
 * }
 * ```
 */
export class ExecutorError extends Error {
  constructor(
    public code: IPCErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'ExecutorError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExecutorError)
    }
  }

  /**
   * Creates an ExecutorError from an IPCErrorDetails object
   */
  static fromIPCError(error: IPCErrorDetails): ExecutorError {
    return new ExecutorError(error.code, error.message)
  }
}
