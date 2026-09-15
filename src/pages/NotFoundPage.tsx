import { Compass } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { paths } from '@/routes/paths'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-5">
      <EmptyState
        icon={<Compass />}
        title="This page does not exist"
        description="The link may be old, or the address mistyped."
        action={
          <Button to={paths.ask} size="md">
            Go to Ask
          </Button>
        }
      />
    </div>
  )
}
