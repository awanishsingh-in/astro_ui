import {
  Activity,
  Cake,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Scale,
  Shield,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { DetailList, DetailRow } from '@/components/account/AccountSection'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { BirthDetailsSheet } from '@/components/account/BirthDetailsSheet'
import { ThemePicker } from '@/components/account/ThemePicker'
import { useToast } from '@/components/feedback/toast-context'
import { Field } from '@/components/forms/Field'
import { Select } from '@/components/forms/Select'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useAuth } from '@/auth/auth-context'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import { GENDER_LABEL, type BirthDetails } from '@/types/user'
import { formatDateLong, formatDateShort, formatPhone, formatTime12 } from '@/utils/format'

export type AccountPanelId =
  | 'profile'
  | 'settings'
  | 'languages'
  | 'help'
  | 'upgrade-plan'
  | 'usage'
  | 'billing'
  | 'terms'
  | 'policies'
  | 'privacy'

export interface AccountPanelProps {
  panel: AccountPanelId | null
  onClose: () => void
  /** Open another panel from within (e.g. Settings → Usage). */
  onOpenPanel?: (panel: AccountPanelId) => void
}

const SETTINGS_LINKS: {
  id: AccountPanelId
  label: string
  description: string
  icon: typeof Activity
}[] = [
  {
    id: 'usage',
    label: 'Usage',
    description: 'Questions, readings and chart opens this month.',
    icon: Activity,
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Plan, payments and invoices.',
    icon: CreditCard,
  },
  {
    id: 'terms',
    label: 'Terms and conditions',
    description: 'How Cyklos may be used.',
    icon: FileText,
  },
  {
    id: 'policies',
    label: 'Policies',
    description: 'Community and content guidelines.',
    icon: Scale,
  },
  {
    id: 'privacy',
    label: 'Profile privacy',
    description: 'What is stored, and who can see it.',
    icon: Shield,
  },
]

const META: Record<AccountPanelId, { title: string; description?: string }> = {
  profile: { title: 'Profile', description: 'You and the birth details your chart is built from.' },
  settings: { title: 'Settings', description: 'Usage, billing, legal and privacy.' },
  languages: { title: 'Languages', description: 'Interface language for Cyklos.' },
  help: { title: 'Get help', description: 'Something not making sense?' },
  'upgrade-plan': { title: 'Upgrade plan', description: 'What a plan unlocks, and what stays free.' },
  usage: { title: 'Usage', description: 'What this account has used this month.' },
  billing: { title: 'Billing', description: 'Plan, payments and invoices.' },
  terms: { title: 'Terms and conditions', description: 'The short version, in plain words.' },
  policies: { title: 'Policies', description: 'Community and content guidelines.' },
  privacy: { title: 'Profile privacy', description: 'What is stored, and where.' },
}

const SETTINGS_CHILDREN = new Set<AccountPanelId>([
  'usage',
  'billing',
  'terms',
  'policies',
  'privacy',
])

/**
 * Account sections as overlays — desktop modal, mobile sheet.
 * Used from the avatar menu so settings never take over the whole page.
 */
export function AccountPanel({ panel, onClose, onOpenPanel }: AccountPanelProps) {
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const { user, updateBirthDetails, updatePreferences } = useAuth()
  const toast = useToast()
  const birthSheet = useDisclosure()
  const [isSaving, setIsSaving] = useState(false)

  const isOpen = panel !== null
  const meta = panel ? META[panel] : META.profile

  // Close birth editor when the parent panel closes.
  useEffect(() => {
    if (!isOpen) birthSheet.close()
  }, [isOpen, birthSheet])

  const saveBirthDetails = useCallback(
    async (details: BirthDetails) => {
      setIsSaving(true)
      try {
        await updateBirthDetails(details)
        birthSheet.close()
        toast.success('Chart recalculated', {
          description: 'Your readings are untouched — each one keeps the chart it was read from.',
        })
      } catch (caught) {
        toast.error('Could not save', { description: toAppError(caught).message })
      } finally {
        setIsSaving(false)
      }
    },
    [updateBirthDetails, birthSheet, toast],
  )

  const openChild = (id: AccountPanelId) => {
    onOpenPanel?.(id)
  }

  const backToSettings =
    panel && SETTINGS_CHILDREN.has(panel) ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openChild('settings')}
        iconLeft={<ChevronLeft className="size-4" />}
        className="-ml-2 mb-3"
      >
        Settings
      </Button>
    ) : null

  if (!user) return null

  const body = (
    <>
      {backToSettings}

      {panel === 'profile' && (
        <div className="space-y-5">
          <CelestialCard motifs={['stars', 'orbits']} tone="midnight" seed={user.phone} padding="lg">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={user.fullName} initials={user.initials} src={user.photoUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-heading font-semibold text-on-celestial">
                  {user.fullName}
                </p>
                <p className="font-mono text-data text-on-celestial-muted">
                  {formatPhone(user.phone)}
                </p>
              </div>
            </div>
            <AstroMetadata
              tone="dark"
              className="mt-5"
              items={[
                { label: 'Born', value: formatDateShort(user.birthDetails.date) },
                {
                  label: 'At',
                  value: user.birthDetails.timeUnknown
                    ? 'time unknown'
                    : formatTime12(user.birthDetails.time),
                },
                { label: 'In', value: user.birthDetails.place.label.split(',')[0] },
              ]}
            />
          </CelestialCard>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sub font-semibold text-ink">Birth details</p>
              <p className="text-xs text-muted">Used to calculate your chart.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={birthSheet.open}
              iconLeft={<Cake className="size-4" />}
            >
              Edit
            </Button>
          </div>

          <DetailList>
            <DetailRow label="Name" value={user.birthDetails.fullName} />
            <DetailRow
              label="Gender"
              value={
                user.birthDetails.gender ? GENDER_LABEL[user.birthDetails.gender] : 'Not set'
              }
            />
            <DetailRow label="Date of birth" value={formatDateLong(user.birthDetails.date)} />
            <DetailRow
              label="Time of birth"
              value={
                user.birthDetails.timeUnknown
                  ? 'Not known — noon assumed'
                  : formatTime12(user.birthDetails.time)
              }
            />
            <DetailRow
              label="Birth place"
              value={user.birthDetails.place.label}
              note={`${user.birthDetails.place.latitude.toFixed(2)}°N ${user.birthDetails.place.longitude.toFixed(2)}°E`}
            />
          </DetailList>
        </div>
      )}

      {panel === 'settings' && (
        <div className="space-y-5">
          <Card padding="lg" className="gap-6">
            <ThemePicker />
            <div className="border-t border-border pt-5">
              <Field label="Default chart" help="Which divisional chart My Chart opens on.">
                <Select
                  options={[
                    { value: 'D1', label: 'D-1 Rashi · the whole life' },
                    { value: 'D9', label: 'D-9 Navamsa · marriage, real strength' },
                    { value: 'D10', label: 'D-10 Dashamsa · work, standing' },
                  ]}
                  defaultValue="D1"
                  onChange={() =>
                    toast.info('Not stored yet', {
                      description: 'My Chart still opens on D-1 Rashi.',
                    })
                  }
                />
              </Field>
            </div>
          </Card>

          <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {SETTINGS_LINKS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openChild(item.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-navy-soft/60"
                  >
                    <span
                      aria-hidden
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-sunken text-gold-deep"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sub font-medium text-ink">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted text-pretty">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {panel === 'usage' && (
        <DetailList>
          <DetailRow label="Questions asked" value="12 of unlimited on Free" />
          <DetailRow label="Readings saved" value="8" />
          <DetailRow label="Charts opened" value="34" />
          <DetailRow
            label="Plan"
            value="Free"
            note="Upgrade for deeper reports and priority Ask"
          />
        </DetailList>
      )}

      {panel === 'billing' && (
        <Card padding="lg" className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-heading font-semibold text-ink">Free</p>
            <Badge tone="neutral" mono>
              No card on file
            </Badge>
          </div>
          <p className="text-sm text-purple text-pretty">
            You are not being charged. Invoices and payment methods will appear here when you
            upgrade.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openChild('upgrade-plan')}
            iconRight={<ChevronRight className="size-4" />}
            className="w-fit"
          >
            See Upgrade plan
          </Button>
        </Card>
      )}

      {panel === 'terms' && (
        <Card padding="lg" className="gap-3">
          {[
            'Cyklos calculates a chart from the details you give and reads answers from it. Every answer names what it was read from.',
            'Nothing here is advice — medical, legal or financial. An answer describes what a chart shows, and says plainly what it does not.',
            'You can delete your account at any time. Deleting it removes your chart and your readings.',
          ].map((clause) => (
            <p key={clause} className="text-sm text-purple text-pretty">
              {clause}
            </p>
          ))}
        </Card>
      )}

      {panel === 'policies' && (
        <Card padding="lg" className="gap-3">
          {[
            'Ask is for personal chart questions. Do not use it to harass others or request readings about someone without their consent.',
            'Charts and readings belong to the account that created them. Sharing a reading is your choice; Cyklos does not publish them.',
            'We may refuse or remove content that breaks the law or these guidelines.',
          ].map((clause) => (
            <p key={clause} className="text-sm text-purple text-pretty">
              {clause}
            </p>
          ))}
        </Card>
      )}

      {panel === 'privacy' && (
        <DetailList>
          <DetailRow
            label="Birth details"
            value="Used to calculate your chart and nothing else. Never sold, never shared."
          />
          <DetailRow
            label="Your readings"
            value="Stored against your account so they can be indexed by bhava and period."
          />
          <DetailRow
            label="Where it lives"
            value="In this demo, entirely in your browser."
            note="localStorage · no server, no analytics, no third parties"
          />
          <DetailRow label="Advertising" value="There is none, and no tracker is ever loaded." />
        </DetailList>
      )}

      {panel === 'languages' && (
        <Field
          label="Interface language"
          help="Hindi and regional languages are planned. The interface is English only today."
        >
          <Select
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी — coming later' },
            ]}
            value={user.language}
            onChange={(event) => {
              const language = event.target.value as typeof user.language
              updatePreferences({ language })
              toast.info(
                language === 'hi'
                  ? 'Hindi is not translated yet'
                  : 'Interface language set to English',
                {
                  description:
                    language === 'hi'
                      ? 'Your preference is saved. The interface stays English until translation ships.'
                      : undefined,
                },
              )
            }}
          />
        </Field>
      )}

      {panel === 'help' && (
        <div className="space-y-4">
          <p className="text-sm text-purple text-pretty">
            Every answer in Cyklos shows the house, the planets and the period it was read from —
            so the fastest way to understand one is usually to open it in your chart.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose()
                navigate(paths.chart)
              }}
            >
              Open my chart
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose()
                navigate(paths.everything)
              }}
            >
              See everything Cyklos does
            </Button>
          </div>
        </div>
      )}

      {panel === 'upgrade-plan' && (
        <Card padding="lg" className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-heading font-semibold text-ink">Free</p>
            <Badge tone="neutral" mono>
              Current plan
            </Badge>
          </div>
          <ul className="space-y-2">
            {[
              'Your full chart and all sixteen divisionals',
              'Unlimited questions read from your chart',
              'Every reading kept, indexed by bhava and period',
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-purple">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast.info('Paid plans are not live yet', {
                description: 'You stay on Free — nothing is charged.',
              })
            }
            className="w-fit"
          >
            See what a plan adds
          </Button>
        </Card>
      )}
    </>
  )

  const shell = isDesktop ? (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meta.title}
      description={meta.description}
      size="md"
    >
      {body}
    </Modal>
  ) : (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={meta.title}
      description={meta.description}
    >
      {body}
    </BottomSheet>
  )

  return (
    <>
      {shell}
      <BirthDetailsSheet
        isOpen={birthSheet.isOpen}
        onClose={birthSheet.close}
        details={user.birthDetails}
        onSave={saveBirthDetails}
        isSaving={isSaving}
      />
    </>
  )
}
