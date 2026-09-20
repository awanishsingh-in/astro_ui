import { Button } from '@/components/common/Button'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { Modal } from '@/components/modals/Modal'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { paths } from '@/routes/paths'
import { useNavigate } from 'react-router-dom'

export function RemindAccountGate({
  isOpen,
  onClose,
  title,
  whenLabel,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  whenLabel: string
}) {
  const desktop = useIsDesktop()
  const navigate = useNavigate()
  const Overlay = desktop ? Modal : BottomSheet

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Save this reminder"
      description={`Reminders for ${title} (${whenLabel}) need an account. It is free — no payment, no plan change.`}
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" size="md" onClick={onClose}>
            Not now — keep reading
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate(paths.signIn)}>
            Continue with phone number
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted text-pretty">
          Calendar reading stays open for everyone. Remembering a date is free, but it needs a signed-in
          identity so the reminder can find you.
        </p>
        <Button variant="secondary" size="md" fullWidth disabled>
          Continue with Google
        </Button>
        <p className="text-center font-mono text-label uppercase text-faint">or</p>
        <Button variant="secondary" size="md" fullWidth onClick={() => navigate(paths.signIn)}>
          Send me a link
        </Button>
      </div>
    </Overlay>
  )
}
