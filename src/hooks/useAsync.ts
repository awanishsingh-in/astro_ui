import { useCallback, useEffect, useRef, useState } from 'react'
import { toAppError } from '@/services/client'
import type { AsyncState } from '@/types/ui'

/**
 * Run a service call and expose the four states every screen renders:
 * idle, loading, success, error — plus `retry` for ErrorState.
 *
 * Requests are aborted on unmount and on re-run, so a slow response can never
 * overwrite a newer one.
 */
export function useAsync<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })
  const [nonce, setNonce] = useState(0)

  // Keep the latest fn without making it a dependency of the effect.
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setState({ status: 'loading' })

    fnRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return
        setState({ status: 'error', error: toAppError(error) })
      })

    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const retry = useCallback(() => setNonce((n) => n + 1), [])

  return { ...state, retry }
}
