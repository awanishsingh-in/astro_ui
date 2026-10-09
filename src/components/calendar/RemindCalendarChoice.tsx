import { Bell, CalendarPlus } from 'lucide-react'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/common/Button'
import { useToast } from '@/components/feedback/toast-context'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { addCyklosCalendarEvent } from '@/onboarding/cyklos-calendar'
import { addPushReminder, type PushReminderKind } from '@/onboarding/push-reminders'
import { googleCalendarUrl } from '@/utils/event-calendar'
import { RemindAccountGate } from './RemindAccountGate'

export function RemindCalendarChoice({
  isOpen,
  onClose,
  title,
  dateIso,
  whenLabel,
  kind = 'other',
  onSaved,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  dateIso: string
  whenLabel: string
  kind?: PushReminderKind
  onSaved?: () => void
}) {
  const desktop = useIsDesktop()
  const toast = useToast()
  const { user } = useAuth()

  if (!user) {
    return (
      <RemindAccountGate
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        whenLabel={whenLabel}
      />
    )
  }

  function addToCyklos() {
    const result = addCyklosCalendarEvent(user!.id, { title, dateIso, whenLabel })
    if (result.already) {
      toast.info('Already on Cyklos calendar', {
        description: `${title} · ${whenLabel}`,
      })
    } else {
      toast.success('Added to Cyklos calendar', {
        description: `${title} · ${whenLabel}`,
      })
    }
    onClose()
  }

  function addToGoogle() {
    window.open(
      googleCalendarUrl({ title, dateIso, details: `${title} · ${whenLabel}` }),
      '_blank',
    )
    toast.success('Opening Google Calendar', {
      description: 'Confirm the event to save it.',
    })
    onClose()
  }

  function addNotification() {
    const notifyAt = user!.notifications.time || '08:00'
    const result = addPushReminder(user!.id, {
      title,
      dateIso,
      whenLabel,
      kind,
      timing: 'day-of',
      notifyAt,
    })

    if (result.already) {
      toast.info('Notification already on', {
        description: `${title} · Cyklos will alert you on this day`,
      })
    } else {
      toast.success('Notification added', {
        description: user!.notifications.enabled
          ? `${title} · push from the app on ${whenLabel}`
          : `${title} · turn on Notifications in Account to receive it`,
      })
    }
    onSaved?.()
    onClose()
  }

  const body = (
    <div className="flex flex-col gap-2.5">
      <Button
        variant="primary"
        size="md"
        className="w-full justify-start rounded-2xl"
        iconLeft={<CalendarPlus className="size-4" />}
        onClick={addToCyklos}
      >
        Add to Cyklos calendar
      </Button>
      <Button
        variant="secondary"
        size="md"
        className="w-full justify-start rounded-2xl"
        iconLeft={<CalendarPlus className="size-4" />}
        onClick={addToGoogle}
      >
        Add to Google Calendar
      </Button>
      <Button
        variant="secondary"
        size="md"
        className="w-full justify-start rounded-2xl"
        iconLeft={<Bell className="size-4" />}
        onClick={addNotification}
      >
        Add notification
      </Button>
    </div>
  )

  if (desktop) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Remind me"
        description={`Add ${title} (${whenLabel}) to a calendar, or get a Cyklos notification when it matters.`}
        size="sm"
      >
        {body}
      </Modal>
    )
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Remind me"
      description={`Add ${title} (${whenLabel}) to a calendar, or get a Cyklos notification when it matters.`}
    >
      {body}
    </BottomSheet>
  )
}
