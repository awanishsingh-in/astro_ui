import type { AppError } from '@/types/ui'

/**
 * The single seam between the UI and the backend.
 *
 * Today every service resolves mock JSON through `mockRequest`. When the real
 * API exists, swap the body of `request` for a `fetch` and delete
 * `mockRequest` — no component, hook or page changes, because they only ever
 * see the typed promise this module returns.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Flip to false once the backend is live. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export class ApiError extends Error implements AppError {
  code: string
  retryable: boolean

  constructor(message: string, code = 'UNKNOWN', retryable = true) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.retryable = retryable
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  signal?: AbortSignal
}

/** Real network call. Unused while `USE_MOCKS` is true, kept ready. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 'NETWORK', true)
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? 'Not found.' : 'Something went wrong on our side.',
      response.status === 404 ? 'NOT_FOUND' : 'SERVER',
      response.status >= 500,
    )
  }

  return (await response.json()) as T
}

/**
 * Resolve mock data after a short, believable delay so loading and error
 * states are exercised during development rather than only in production.
 */
export function mockRequest<T>(
  data: T | (() => T),
  { delay = 420, signal }: { delay?: number; signal?: AbortSignal } = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError('Request cancelled.', 'ABORTED', false))
      return
    }

    const timer = setTimeout(() => {
      try {
        resolve(typeof data === 'function' ? (data as () => T)() : data)
      } catch (error) {
        reject(
          error instanceof ApiError
            ? error
            : new ApiError('Could not load this. Try again.', 'MOCK', true),
        )
      }
    }, delay)

    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new ApiError('Request cancelled.', 'ABORTED', false))
    })
  })
}

/** Normalise anything thrown into the shape `ErrorState` renders. */
export function toAppError(error: unknown): AppError {
  if (error instanceof ApiError) {
    return { message: error.message, code: error.code, retryable: error.retryable }
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN', retryable: true }
  }
  return { message: 'Something went wrong.', code: 'UNKNOWN', retryable: true }
}
