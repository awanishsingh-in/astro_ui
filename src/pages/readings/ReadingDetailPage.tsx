import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { useToast } from '@/components/feedback/toast-context'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { ReadingDetail } from '@/components/readings/ReadingDetail'
import { useAuth } from '@/auth/auth-context'
import { useAsync } from '@/hooks/useAsync'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { getReading } from '@/services/readings.service'

/**
 * One reading, set as a 760px editorial column on desktop and a single column
 * on mobile. The seven parts live in `ReadingDetail`; this page is routing,
 * fetching and the three states around it.
 */
export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const { status, data, error, retry } = useAsync(
    (signal) => getReading(id ?? '', signal),
    [id],
  )

  const askFollowUp = useCallback(
    (question: string) => navigate(`${paths.ask}?q=${encodeURIComponent(question)}`),
    [navigate],
  )

  const askAgain = useCallback(() => {
    if (!data) return
    toast.info('Re-reading against today’s period', {
      description: 'The same question, checked against the dasha running now.',
    })
    navigate(`${paths.ask}?q=${encodeURIComponent(data.question)}`)
  }, [data, navigate, toast])

  if (!user) return null

  return (
    <>
      {/* The question inside `ReadingDetail` is this page's <h1>. */}
      <MobileHeader title="Reading" titleAs="p" showBack user={user} />

      <PageContainer width="content">
        {status === 'error' ? (
          <ErrorState
            error={error}
            onRetry={error?.retryable === false ? undefined : retry}
            title={error?.code === 'NOT_FOUND' ? 'That reading is gone' : 'This did not load'}
          />
        ) : status === 'loading' || status === 'idle' ? (
          <ReadingDetailSkeleton />
        ) : (
          data && (
            <div className="animate-rise">
              <ReadingDetail reading={data} onFollowUp={askFollowUp} onAskAgain={askAgain} />
            </div>
          )
        )}
      </PageContainer>
    </>
  )
}

/** Shaped like the reading, so the column does not jump when it lands. */
function ReadingDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy
      aria-label="Loading this reading"
      className="mx-auto w-full max-w-reading space-y-8"
    >
      <span className="sr-only">Loading this reading…</span>

      <div className="space-y-4 border-b border-border pb-6">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="border-l-2 border-border pl-5">
        <Skeleton className="h-7 w-3/5" />
      </div>

      <SkeletonText lines={3} />

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      <Skeleton shape="block" className="h-48 w-full" />
    </div>
  )
}
