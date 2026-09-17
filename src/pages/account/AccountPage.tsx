import {
  Activity,
  Bell,
  Cake,
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  Languages,
  LifeBuoy,
  LogOut,
  Plus,
  Scale,
  Settings2,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { AccountSection, DetailList, DetailRow } from '@/components/account/AccountSection'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { BirthDetailsSheet } from '@/components/account/BirthDetailsSheet'
import { ProfileSheet } from '@/components/account/ProfileSheet'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { ThemePicker } from '@/components/account/ThemePicker'
import { ToggleRow } from '@/components/account/ToggleRow'
import { useToast } from '@/components/feedback/toast-context'
import { Field } from '@/components/forms/Field'
import { Input } from '@/components/forms/Input'
import { Select } from '@/components/forms/Select'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { RELATION_LABEL, type ChartProfile } from '@/data/profiles'
import { canAddAdditionalProfile } from '@/data/profile-limits'
import { useDisclosure } from '@/hooks/useDisclosure'
import { PageContainer } from '@/layouts/PageContainer'
import { hasActivePlan, unlockPlan } from '@/onboarding/past-intro'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import { GENDER_LABEL, type BirthDetails } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatDateLong, formatDateShort, formatPhone, formatTime12 } from '@/utils/format'

const SETTINGS_ITEMS = [
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
] as const

const SECTIONS = [
  { id: 'profile', label: 'You', icon: User },
  { id: 'birth', label: 'Birth details', icon: Cake },
  { id: 'charts', label: 'Saved charts', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'subscription', label: 'Upgrade plan', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings2 },
  { id: 'language', label: 'Languages', icon: Languages },
  { id: 'help', label: 'Get help', icon: LifeBuoy },
] as const

type SettingsItemId = (typeof SETTINGS_ITEMS)[number]['id']
type SectionId = (typeof SECTIONS)[number]['id'] | SettingsItemId

const SETTINGS_ITEM_IDS = new Set<string>(SETTINGS_ITEMS.map((item) => item.id))

function isSettingsArea(id: SectionId): boolean {
  return id === 'settings' || SETTINGS_ITEM_IDS.has(id)
}

function isKnownSection(id: string): id is SectionId {
  return SECTIONS.some((s) => s.id === id) || SETTINGS_ITEM_IDS.has(id)
}

/**
 * E1 / E5 — Account.
 *
 * Birth details live here rather than behind a corner link, because they are
 * the account: everything the product says is calculated from them.
 *
 * Desktop is a two-column layout — navigation left, the active section right.
 * Mobile renders every section in one scroll and opens a sheet for each edit,
 * which is shorter than making people walk in and out of sub-screens.
 */
export default function AccountPage() {
  const { user, signOut, updateBirthDetails, updatePreferences } = useAuth()
  const profiles = useProfiles()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()

  const sectionParam = params.get('section')
  const initialSection: SectionId =
    sectionParam && isKnownSection(sectionParam) ? sectionParam : 'profile'

  const [active, setActive] = useState<SectionId>(initialSection)
  const birthSheet = useDisclosure()
  const profileSheet = useDisclosure()
  const paywall = useDisclosure()
  const [editingProfile, setEditingProfile] = useState<ChartProfile | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [planUnlocked, setPlanUnlocked] = useState(() =>
    user ? hasActivePlan(user.id) : false,
  )

  useEffect(() => {
    if (sectionParam && isKnownSection(sectionParam)) {
      setActive(sectionParam)
    }
  }, [sectionParam])

  // Support legacy ?section=preferences links.
  useEffect(() => {
    if (sectionParam === 'preferences') setActive('settings')
  }, [sectionParam])

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

  const openProfile = (profile?: ChartProfile) => {
    if (
      !profile &&
      user &&
      !canAddAdditionalProfile(profiles.additionalCount, planUnlocked || hasActivePlan(user.id))
    ) {
      paywall.open()
      return
    }
    setEditingProfile(profile)
    profileSheet.open()
  }

  if (!user) return null

  /** Desktop shows one section; mobile shows them all. */
  const only = (id: SectionId) => (active === id ? '' : 'lg:hidden')

  return (
    <>
      <MobileHeader title="Profile" user={user} />

      <PageContainer width="content">
        <div className="lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
          {/* ── Left: account navigation ── */}
          <nav aria-label="Account sections" className="hidden lg:block">
            <div className="sticky top-8 space-y-1">
              <h1 className="mb-4 text-title-lg font-semibold text-ink">Account</h1>
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const isActive =
                  section.id === 'settings' ? isSettingsArea(active) : active === section.id
                return (
                  <div key={section.id}>
                    <button
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setActive(section.id)}
                      className={cn(
                        'flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sub',
                        'transition-[background-color,color] duration-150 ease-out-soft [&_svg]:size-4',
                        isActive
                          ? 'bg-gold-soft font-semibold text-gold-deep'
                          : 'text-purple hover:bg-navy-soft hover:text-ink',
                      )}
                    >
                      <Icon aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{section.label}</span>
                    </button>

                    {section.id === 'settings' && isSettingsArea(active) && (
                      <ul className="mt-1 ml-4 space-y-0.5 border-l border-border pl-2">
                        {SETTINGS_ITEMS.map((item) => {
                          const childActive = active === item.id
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                aria-current={childActive ? 'page' : undefined}
                                onClick={() => setActive(item.id)}
                                className={cn(
                                  'w-full rounded-control px-2.5 py-2 text-left text-sm transition-colors',
                                  childActive
                                    ? 'font-semibold text-gold-deep'
                                    : 'text-purple hover:bg-navy-soft hover:text-ink',
                                )}
                              >
                                {item.label}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}

              <div className="pt-3">
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    signOut()
                    navigate(paths.landing, { replace: true })
                    toast.success('Signed out')
                  }}
                  iconLeft={<LogOut className="size-4" />}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </nav>

          {/* ── Right: the active section ── */}
          <div className="space-y-10 lg:space-y-0">
            <AccountSection id="profile" title="You" className={only('profile')}>
              {/*
                The account's one celestial surface. Everything else in this
                screen is a setting; this is the person the chart belongs to.
              */}
              <CelestialCard
                motifs={['stars', 'orbits']}
                tone="midnight"
                seed={user.phone}
                padding="lg"
              >
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
              <p className="text-sm text-muted text-pretty">
                Your number is how you sign in. There is no password on this account, and there
                never will be.
              </p>
            </AccountSection>

            <AccountSection
              id="birth"
              title="Birth details"
              description="A chart is calculated from these details."
              className={only('birth')}
              action={
                <Button variant="secondary" size="sm" onClick={birthSheet.open}>
                  Edit birth details
                </Button>
              }
            >
              <DetailList>
                <DetailRow label="Name" value={user.birthDetails.fullName} />
                <DetailRow
                  label="Gender"
                  value={
                    user.birthDetails.gender
                      ? GENDER_LABEL[user.birthDetails.gender]
                      : 'Not set'
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
                  note={
                    user.birthDetails.timeUnknown
                      ? 'The lagna is the least certain value'
                      : undefined
                  }
                />
                <DetailRow
                  label="Birth place"
                  value={user.birthDetails.place.label}
                  note={`${user.birthDetails.place.latitude.toFixed(2)}°N ${user.birthDetails.place.longitude.toFixed(2)}°E`}
                />
              </DetailList>

              <Card tone="gold" padding="md" className="gap-1.5">
                <p className="font-mono text-label uppercase text-gold-deep">If you change these</p>
                <p className="text-sm text-purple text-pretty">
                  Changing these recalculates your chart. Past questions and answers stay — every
                  reading keeps the chart and the period it was read from, so its citations remain
                  true.
                </p>
              </Card>
            </AccountSection>

            <AccountSection
              id="charts"
              title="Saved charts"
              description="Family, friends and anyone else whose chart you read. Switching here follows you across the app."
              className={only('charts')}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openProfile(undefined)}
                  iconLeft={<Plus className="size-4" />}
                >
                  Add a chart
                </Button>
              }
            >
              <ul className="space-y-2">
                {profiles.profiles.map((profile) => {
                  const isSelf = profile.id === 'self'
                  const isSelected = profile.id === profiles.selectedId
                  return (
                    <li key={profile.id}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-card border p-3',
                          isSelected ? 'border-gold bg-gold-soft' : 'border-border bg-surface',
                        )}
                      >
                        <Avatar name={profile.name} size="md" />

                        <button
                          type="button"
                          onClick={() => {
                            profiles.select(profile.id)
                            toast.success(`Now reading ${profile.name}’s chart`)
                          }}
                          className="min-h-11 min-w-0 flex-1 py-1 text-left"
                        >
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sub font-medium text-ink">
                              {profile.name}
                            </span>
                            <Badge tone={isSelf ? 'gold' : 'neutral'} mono>
                              {isSelf ? 'You' : RELATION_LABEL[profile.relation]}
                            </Badge>
                            {isSelected && <Check aria-hidden className="size-4 text-gold-deep" />}
                          </span>
                          <span className="block truncate font-mono text-label uppercase text-muted">
                            {formatDateLong(profile.birthDetails.date)}
                            {profile.note ? ` · ${profile.note}` : ''}
                          </span>
                        </button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (isSelf ? birthSheet.open() : openProfile(profile))}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </AccountSection>

            <AccountSection
              id="notifications"
              title="Notifications"
              description="One alert a day, at a time you choose. Nothing else is ever pushed."
              className={only('notifications')}
            >
              <Card padding="none" className="divide-y divide-border">
                <ToggleRow
                  label="Daily alert"
                  description="A single line about the day, read from your chart."
                  checked={user.notifications.enabled}
                  onChange={(enabled) => {
                    updatePreferences({ notifications: { ...user.notifications, enabled } })
                    toast.success(enabled ? 'Daily alert on' : 'Daily alert off')
                  }}
                />
                <div className="p-4">
                  <Field label="Time" help="Your local time.">
                    <Input
                      type="time"
                      mono
                      value={user.notifications.time}
                      disabled={!user.notifications.enabled}
                      onChange={(event) =>
                        updatePreferences({
                          notifications: { ...user.notifications, time: event.target.value },
                        })
                      }
                    />
                  </Field>
                </div>
              </Card>
            </AccountSection>

            <AccountSection
              id="subscription"
              title="Upgrade plan"
              description="What a plan unlocks, and what stays free."
              className={only('subscription')}
            >
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
                  to={paths.explore('subscription')}
                  iconRight={<ChevronRight className="size-4" />}
                  className="w-fit"
                >
                  See what a plan adds
                </Button>
              </Card>
            </AccountSection>

            <AccountSection
              id="settings"
              title="Settings"
              description="Usage, billing, legal and privacy."
              className={active === 'settings' ? '' : 'lg:hidden'}
            >
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

              <ul className="overflow-hidden rounded-card border border-border bg-surface divide-y divide-border">
                {SETTINGS_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActive(item.id)}
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
            </AccountSection>

            <AccountSection
              id="usage"
              title="Usage"
              description="What this account has used this month."
              className={only('usage')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActive('settings')}>
                  Back to Settings
                </Button>
              }
            >
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
            </AccountSection>

            <AccountSection
              id="billing"
              title="Billing"
              description="Plan, payments and invoices."
              className={only('billing')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActive('settings')}>
                  Back to Settings
                </Button>
              }
            >
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
                  onClick={() => setActive('subscription')}
                  iconRight={<ChevronRight className="size-4" />}
                  className="w-fit"
                >
                  See Upgrade plan
                </Button>
              </Card>
            </AccountSection>

            <AccountSection
              id="terms"
              title="Terms and conditions"
              description="The short version, in plain words."
              className={only('terms')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActive('settings')}>
                  Back to Settings
                </Button>
              }
            >
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
            </AccountSection>

            <AccountSection
              id="policies"
              title="Policies"
              description="Community and content guidelines."
              className={only('policies')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActive('settings')}>
                  Back to Settings
                </Button>
              }
            >
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
            </AccountSection>

            <AccountSection
              id="privacy"
              title="Profile privacy"
              description="What is stored, and where."
              className={only('privacy')}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActive('settings')}>
                  Back to Settings
                </Button>
              }
            >
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
                <DetailRow
                  label="Advertising"
                  value="There is none, and no tracker is ever loaded."
                />
              </DetailList>
            </AccountSection>

            <AccountSection
              id="language"
              title="Languages"
              description="Regional languages are confirmed in the product plan."
              className={only('language')}
            >
              <Card padding="lg" className="gap-5">
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
              </Card>
            </AccountSection>

            <AccountSection
              id="help"
              title="Get help"
              description="Something not making sense?"
              className={only('help')}
            >
              <Card padding="lg" className="gap-4">
                <p className="text-sm text-purple text-pretty">
                  Every answer in Cyklos shows the house, the planets and the period it was read
                  from — so the fastest way to understand one is usually to open it in your chart.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" to={paths.chart}>
                    Open my chart
                  </Button>
                  <Button variant="ghost" size="sm" to={paths.everything}>
                    See everything Cyklos does
                  </Button>
                </div>
              </Card>
            </AccountSection>

            {/* Mobile's sign-out. Desktop has it in the left rail. */}
            <div className="lg:hidden">
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  signOut()
                  navigate(paths.landing, { replace: true })
                  toast.success('Signed out')
                }}
                iconLeft={<LogOut className="size-4" />}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>

      <BirthDetailsSheet
        isOpen={birthSheet.isOpen}
        onClose={birthSheet.close}
        details={user.birthDetails}
        onSave={saveBirthDetails}
        isSaving={isSaving}
      />

      <ProfileSheet
        isOpen={profileSheet.isOpen}
        onClose={profileSheet.close}
        editing={editingProfile}
        onSave={(profile) => {
          try {
            if (editingProfile) {
              profiles.update(editingProfile.id, profile)
              toast.success(`${profile.name} updated`)
            } else {
              const created = profiles.add(profile)
              toast.success(`${created.name} added`, {
                description: 'Switch to their chart from Saved charts or My Chart.',
              })
            }
            profileSheet.close()
          } catch (caught) {
            toast.error('Could not save profile', {
              description: caught instanceof Error ? caught.message : toAppError(caught).message,
            })
          }
        }}
        onDelete={(id) => {
          const name = editingProfile?.name ?? 'That chart'
          profiles.remove(id)
          profileSheet.close()
          toast.info(`${name} removed`)
        }}
      />

      <ChatPaywall
        isOpen={paywall.isOpen}
        onClose={paywall.close}
        onUnlock={() => {
          unlockPlan(user.id)
          setPlanUnlocked(true)
          paywall.close()
          setEditingProfile(undefined)
          profileSheet.open()
          toast.success('Profiles unlocked')
        }}
        title="You've reached your free profile limit."
        description="Add more profiles to explore charts for family, friends, and loved ones."
        benefit="Free accounts include two additional profiles. Cyklos Plus unlocks more."
        unlockLabel="Unlock More Profiles"
      />
    </>
  )
}
