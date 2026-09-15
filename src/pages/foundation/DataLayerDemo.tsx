import { useCallback, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAsync } from '@/hooks/useAsync'
import { getChart } from '@/services/chart.service'
import { ApiError } from '@/services/client'
import type { Chart } from '@/types/astrology'
import { formatDegree } from '@/utils/format'

/**
 * Proves the seam between UI and API.
 *
 * `useAsync` drives the same idle → loading → success/error cycle a real
 * endpoint will, and the failure toggle shows that `ErrorState` and `retry`
 * are wired — so the error path is exercised now rather than discovered in
 * production.
 */
export function DataLayerDemo() {
  const [shouldFail, setShouldFail] = useState(false)

  const load = useCallback(
    (signal: AbortSignal): Promise<Chart> => {
      if (shouldFail) {
        return Promise.reject(new ApiError('Could not reach the server.', 'NETWORK', true))
      }
      return getChart('self', 'D1', signal)
    },
    [shouldFail],
  )

  const { status, data, error, retry } = useAsync(load, [shouldFail])

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-label uppercase text-muted">getChart(&apos;self&apos;, &apos;D1&apos;)</span>
          <Badge tone={status === 'error' ? 'critical' : status === 'success' ? 'positive' : 'navy'} mono>
            {status}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShouldFail((v) => !v)}>
          {shouldFail ? 'Restore the endpoint' : 'Make it fail'}
        </Button>
      </div>

      {status === 'loading' && <LoadingState label="Calculating your chart…" lines={4} />}

      {status === 'error' && <ErrorState variant="inline" error={error} onRetry={retry} />}

      {status === 'success' && data && (
        <dl className="grid gap-3 sm:grid-cols-3">
          <Stat label="Lagna" value={`${data.lagna.rashi} ${formatDegree(data.lagna.degree, data.lagna.minute)}`} />
          <Stat label="Grahas" value={String(data.grahas.length)} />
          <Stat label="SAV total" value={String(data.ashtakavarga.total)} />
        </dl>
      )}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border p-3">
      <dt className="font-mono text-label uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-data-lg text-ink">{value}</dd>
    </div>
  )
}
