import {
  Cake,
  Camera,
  Check,
  Eye,
  ImagePlus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { DetailList, DetailRow } from '@/components/account/AccountSection'
import { BirthDetailsSheet } from '@/components/account/BirthDetailsSheet'
import { AddProfileFolders } from '@/components/account/AddProfileFolders'
import { ProfileSheet } from '@/components/account/ProfileSheet'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { AstroMetadata } from '@/components/celestial/AstroMetadata'
import { CelestialCard } from '@/components/celestial/CelestialCard'
import { useToast } from '@/components/feedback/toast-context'
import { Modal } from '@/components/modals/Modal'
import { HIGHLIGHT_ADD_PROFILE_KEY, setAddFormVisibleInChrome } from '@/components/navigation/FullPageChrome'
import { useAuth } from '@/auth/auth-context'
import { RELATION_LABEL, type ChartProfile, type ProfileRelation } from '@/data/profiles'
import { canAddAdditionalProfile } from '@/data/profile-limits'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { PageContainer } from '@/layouts/PageContainer'
import { hasActivePlan, unlockPlan } from '@/onboarding/past-intro'
import { useProfiles } from '@/profiles/profiles-context'
import type { NewProfile } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import { toAppError } from '@/services/client'
import { GENDER_LABEL, type BirthDetails } from '@/types/user'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { PROFILE_PHOTO_ACCEPT, readProfilePhoto } from '@/utils/profile-photo'
import { formatDateLong, formatDateShort, formatPhone, formatTime12 } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Full-page profile — photo, primary account, and additional charts.
 * Free accounts may add two extra profiles; further adds open the Plus paywall.
 */
export default function ProfilePage() {
  const { user, updateBirthDetails, updatePhoto } = useAuth()
  const profiles = useProfiles()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const isDesktop = useIsDesktop()

  const birthSheet = useDisclosure()
  const profileSheet = useDisclosure()
  const paywall = useDisclosure()
  const deleteConfirm = useDisclosure()

  const fileRef = useRef<HTMLInputElement>(null)
  const [isSavingBirth, setIsSavingBirth] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ChartProfile | undefined>()
  const [pendingDelete, setPendingDelete] = useState<ChartProfile | null>(null)
  const [planUnlocked, setPlanUnlocked] = useState(() =>
    user ? hasActivePlan(user.id) : false,
  )
  const [defaultRelation, setDefaultRelation] = useState<Exclude<ProfileRelation, 'self'>>(
    'family',
  )
  /** When set, the dashed + in the top chrome opens the birth form (skips folder picker). */
  const [pendingRelation, setPendingRelation] = useState<Exclude<ProfileRelation, 'self'> | null>(
    null,
  )
  const folders = useDisclosure()

  const [inlineAddOpen, setInlineAddOpen] = useState(false)

  const additional = profiles.saved
  const canAdd = canAddAdditionalProfile(additional.length, planUnlocked)

  const isInlineRelation = (relation: Exclude<ProfileRelation, 'self'>) =>
    relation === 'friend' || relation === 'relative' || relation === 'other'

  const pulseAddInChrome = useCallback(() => {
    try {
      sessionStorage.setItem(HIGHLIGHT_ADD_PROFILE_KEY, '1')
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('cyklos-highlight-add'))
  }, [])

  const openFormForRelation = useCallback(
    (relation: Exclude<ProfileRelation, 'self'>) => {
      setDefaultRelation(relation)
      setPendingRelation(relation)
      setEditingProfile(undefined)
      setAddFormVisibleInChrome(true)
      if (isInlineRelation(relation)) {
        profileSheet.close()
        setInlineAddOpen(true)
        return
      }
      setInlineAddOpen(false)
      window.setTimeout(() => profileSheet.open(), 50)
    },
    [profileSheet],
  )

  const closeProfileSheet = useCallback(() => {
    setAddFormVisibleInChrome(false)
    setInlineAddOpen(false)
    profileSheet.close()
  }, [profileSheet])

  const openEdit = useCallback(
    (profile: ChartProfile) => {
      if (profile.id === 'self') {
        birthSheet.open()
        return
      }
      setEditingProfile(profile)
      profileSheet.open()
    },
    [birthSheet, profileSheet],
  )

  const startAddWithRelation = useCallback(
    (relation: Exclude<ProfileRelation, 'self'>) => {
      folders.close()
      if (!canAdd) {
        window.setTimeout(() => paywall.open(), 50)
        return
      }
      setDefaultRelation(relation)
      setPendingRelation(relation)
      setInlineAddOpen(false)
      setAddFormVisibleInChrome(false)
      profileSheet.close()
      // Family: stay on You / self with the dashed + highlighted — form opens from +.
      if (relation === 'family') {
        profiles.select('self')
        pulseAddInChrome()
        return
      }
      pulseAddInChrome()
      window.setTimeout(() => openFormForRelation(relation), 50)
    },
    [folders, canAdd, paywall, pulseAddInChrome, openFormForRelation, profileSheet, profiles],
  )

  // Top chrome / deep-links: ?add=1, ?relation=, ?form=1, ?edit=
  useEffect(() => {
    const add = params.get('add')
    const relation = params.get('relation')
    const openForm = params.get('form') === '1'
    const editId = params.get('edit')

    if (editId) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('edit')
          return next
        },
        { replace: true },
      )
      const target = profiles.profiles.find((p) => p.id === editId)
      if (target) openEdit(target)
      return
    }

    if (add !== '1') return

    const valid: Exclude<ProfileRelation, 'self'> | null =
      relation === 'family' ||
      relation === 'friend' ||
      relation === 'relative' ||
      relation === 'other'
        ? relation
        : null

    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('add')
        next.delete('relation')
        next.delete('form')
        return next
      },
      { replace: true },
    )

    if (!canAddAdditionalProfile(additional.length, planUnlocked)) {
      paywall.open()
      return
    }

    // Chrome dashed + with a pending folder → form (Family popup, others inline).
    if (!valid && pendingRelation) {
      openFormForRelation(pendingRelation)
      return
    }

    if (valid) {
      setDefaultRelation(valid)
      setPendingRelation(valid)
      // Family only: show self in the top nav + page details; wait for + to open popup.
      if (valid === 'family') {
        profiles.select('self')
        setInlineAddOpen(false)
        setAddFormVisibleInChrome(false)
        profileSheet.close()
        pulseAddInChrome()
        return
      }
      pulseAddInChrome()
      if (openForm) {
        window.setTimeout(() => openFormForRelation(valid), 80)
      }
      return
    }

    // Plain + from chrome with no pending folder → folder picker.
    folders.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const saveBirthDetails = useCallback(
    async (details: BirthDetails) => {
      setIsSavingBirth(true)
      try {
        await updateBirthDetails(details)
        birthSheet.close()
        toast.success('Chart recalculated', {
          description: 'Your readings are untouched — each one keeps the chart it was read from.',
        })
      } catch (caught) {
        toast.error('Could not save', { description: toAppError(caught).message })
      } finally {
        setIsSavingBirth(false)
      }
    },
    [updateBirthDetails, birthSheet, toast],
  )

  const onPickPhoto = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setIsUploading(true)
      try {
        const dataUrl = await readProfilePhoto(file)
        await updatePhoto(dataUrl)
        toast.success('Profile photo updated')
      } catch (caught) {
        toast.error('Could not update photo', {
          description: caught instanceof Error ? caught.message : toAppError(caught).message,
        })
      } finally {
        setIsUploading(false)
        if (fileRef.current) fileRef.current.value = ''
      }
    },
    [updatePhoto, toast],
  )

  const removePhoto = useCallback(async () => {
    setIsUploading(true)
    try {
      await updatePhoto(null)
      toast.success('Profile photo removed')
    } catch (caught) {
      toast.error('Could not remove photo', { description: toAppError(caught).message })
    } finally {
      setIsUploading(false)
    }
  }, [updatePhoto, toast])

  const saveAdditional = async (data: NewProfile) => {
    setIsSavingProfile(true)
    try {
      if (editingProfile) {
        profiles.update(editingProfile.id, data)
        setAddFormVisibleInChrome(false)
        profileSheet.close()
        toast.success(`${data.name} updated`)
      } else {
        const created = profiles.add(data)
        profiles.select(created.id)
        setPendingRelation(null)
        setInlineAddOpen(false)
        setAddFormVisibleInChrome(false)
        profileSheet.close()
        toast.success(`${created.name} added`, {
          description: 'Opening their chart.',
        })
        navigate(paths.chart)
      }
    } catch (caught) {
      toast.error('Could not save profile', {
        description: caught instanceof Error ? caught.message : toAppError(caught).message,
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const askDelete = (profile: ChartProfile) => {
    setPendingDelete(profile)
    deleteConfirm.open()
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const name = pendingDelete.name
    profiles.remove(pendingDelete.id)
    deleteConfirm.close()
    setPendingDelete(null)
    setAddFormVisibleInChrome(false)
    profileSheet.close()
    toast.info(`${name} removed`)
  }

  const viewProfile = (profile: ChartProfile) => {
    profiles.select(profile.id)
    navigate(paths.chart)
  }

  if (!user) return null

  const self = profiles.profiles.find((p) => p.id === 'self')
  const DeleteOverlay = isDesktop ? Modal : BottomSheet

  return (
    <>
      <PageContainer width="reading">
        <article className="mx-auto w-full max-w-reading animate-rise space-y-8">
          <header className="space-y-1">
            <p className="font-mono text-label uppercase text-muted">Profile</p>
            <h1 className="font-serif text-title font-normal text-ink text-balance lg:text-title-lg">
              You
            </h1>
            <p className="text-sub text-purple text-pretty">
              You and the birth details your chart is built from — plus charts for people you care
              about.
            </p>
          </header>

          {/* Friend / Relative / Other — form on the page, not a popup. */}
          <ProfileSheet
            presentation="inline"
            isOpen={inlineAddOpen}
            onClose={closeProfileSheet}
            defaultRelation={defaultRelation}
            onSave={saveAdditional}
            isSaving={isSavingProfile}
          />

          {!inlineAddOpen && (
            <>
          {/* Additional charts are switched from the top chrome pills. */}
          <section className="space-y-3">
            <div>
              <p className="text-sub font-semibold text-ink">Saved charts</p>
              <p className="text-xs text-muted text-pretty">
                People you have added — open one from the bar above, or use + to add another.
              </p>
            </div>
          </section>

          {/* ── Primary account ── */}
          <CelestialCard motifs={['stars', 'orbits']} tone="midnight" seed={user.phone} padding="lg">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <Avatar
                  name={user.fullName}
                  initials={user.initials}
                  src={user.photoUrl}
                  size="xl"
                  className="border-gold-border/50 text-on-celestial"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileRef.current?.click()}
                  aria-label="Upload profile photo"
                  className={cn(
                    'absolute -bottom-1 -right-1 inline-flex size-9 items-center justify-center',
                    'rounded-full border border-gold-border bg-copper text-midnight shadow-glow',
                    'transition-transform hover:scale-105 active:scale-95',
                    'disabled:pointer-events-none disabled:opacity-60',
                  )}
                >
                  <Camera className="size-4" aria-hidden />
                </button>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="truncate text-heading font-semibold text-on-celestial">
                    {user.fullName}
                  </p>
                  <p className="font-mono text-data text-on-celestial-muted">
                    {formatPhone(user.phone)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="celestialGhost"
                    size="sm"
                    loading={isUploading}
                    onClick={() => fileRef.current?.click()}
                    iconLeft={<ImagePlus className="size-4" />}
                  >
                    {user.photoUrl ? 'Change photo' : 'Add photo'}
                  </Button>
                  {user.photoUrl && (
                    <Button
                      variant="celestialGhost"
                      size="sm"
                      disabled={isUploading}
                      onClick={removePhoto}
                      iconLeft={<Trash2 className="size-4" />}
                    >
                      Remove
                    </Button>
                  )}
                </div>
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

          <input
            ref={fileRef}
            type="file"
            accept={PROFILE_PHOTO_ACCEPT}
            className="sr-only"
            onChange={(event) => onPickPhoto(event.target.files?.[0])}
          />

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

          {/* ── Manage additional profiles ── */}
          <section className="space-y-4 border-t border-border pt-8">
            <div>
              <p className="text-sub font-semibold text-ink">Manage</p>
              <p className="text-xs text-muted text-pretty">
                View, edit or remove saved charts — up to {profiles.freeAdditionalLimit} free,
                then Plus.
              </p>
            </div>

            <ul className="space-y-2">
              {self && (
                <li>
                  <ProfileCard
                    profile={self}
                    selected={profiles.selectedId === self.id}
                    isPrimary
                    onView={() => viewProfile(self)}
                    onEdit={birthSheet.open}
                  />
                </li>
              )}

              {additional.map((profile) => (
                <li key={profile.id}>
                  <ProfileCard
                    profile={profile}
                    selected={profiles.selectedId === profile.id}
                    onView={() => viewProfile(profile)}
                    onEdit={() => openEdit(profile)}
                    onDelete={() => askDelete(profile)}
                  />
                </li>
              ))}
            </ul>

            {additional.length === 0 && (
              <p className="rounded-card border border-dashed border-border bg-surface-sunken/40 px-4 py-5 text-center text-sm text-muted text-pretty">
                No additional profiles yet. Use the + above to add someone.
              </p>
            )}
          </section>
            </>
          )}
        </article>
      </PageContainer>

      <BirthDetailsSheet
        isOpen={birthSheet.isOpen}
        onClose={birthSheet.close}
        details={user.birthDetails}
        onSave={saveBirthDetails}
        isSaving={isSavingBirth}
      />

      <ProfileSheet
        presentation="overlay"
        isOpen={profileSheet.isOpen}
        onClose={closeProfileSheet}
        editing={editingProfile}
        defaultRelation={defaultRelation}
        onSave={saveAdditional}
        isSaving={isSavingProfile}
        onDelete={
          editingProfile
            ? () => {
                askDelete(editingProfile)
              }
            : undefined
        }
      />

      <AddProfileFolders
        isOpen={folders.isOpen}
        onClose={folders.close}
        onSelect={startAddWithRelation}
      />

      <ChatPaywall
        isOpen={paywall.isOpen}
        onClose={paywall.close}
        onUnlock={() => {
          unlockPlan(user.id)
          setPlanUnlocked(true)
          paywall.close()
          setEditingProfile(undefined)
          setAddFormVisibleInChrome(true)
          profileSheet.open()
          toast.success('Profiles unlocked', {
            description: 'You can add more charts for family and friends.',
          })
        }}
        title="You've reached your free profile limit."
        description="Add more profiles to explore charts for family, friends, and loved ones."
        benefit="Free accounts include two additional profiles. Cyklos Plus unlocks more."
        unlockLabel="Unlock More Profiles"
      />

      <DeleteOverlay
        isOpen={deleteConfirm.isOpen}
        onClose={() => {
          deleteConfirm.close()
          setPendingDelete(null)
        }}
        title="Remove this profile?"
        description={
          pendingDelete
            ? `${pendingDelete.name}'s chart will be deleted from this account. Readings already drawn from it stay.`
            : undefined
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                deleteConfirm.close()
                setPendingDelete(null)
              }}
            >
              Keep profile
            </Button>
            <Button variant="danger" size="md" onClick={confirmDelete}>
              Delete profile
            </Button>
          </div>
        }
      >
        <p className="text-sm text-purple text-pretty">
          This frees a slot on the free plan. You can add someone else later.
        </p>
      </DeleteOverlay>
    </>
  )
}

function ProfileCard({
  profile,
  selected,
  isPrimary,
  onView,
  onEdit,
  onDelete,
}: {
  profile: ChartProfile
  selected: boolean
  isPrimary?: boolean
  onView: () => void
  onEdit: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-card border p-3 transition-colors sm:p-4',
        selected ? 'border-gold bg-gold-soft/50' : 'border-border bg-surface',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={profile.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sub font-medium text-ink">{profile.name}</p>
            <Badge tone={isPrimary ? 'gold' : 'neutral'} mono>
              {isPrimary ? 'You' : RELATION_LABEL[profile.relation]}
            </Badge>
            {selected && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-gold-deep">
                <Check className="size-3" aria-hidden />
                Active
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-label uppercase text-muted">
            {formatDateShort(profile.birthDetails.date)}
            {' · '}
            {profile.birthDetails.place.label.split(',')[0]}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onView} iconLeft={<Eye className="size-3.5" />}>
          View
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} iconLeft={<Pencil className="size-3.5" />}>
          Edit
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            iconLeft={<Trash2 className="size-3.5" />}
            className="text-critical hover:bg-critical-soft"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
