import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/auth-context'
import { FREE_ADDITIONAL_PROFILES, canAddAdditionalProfile } from '@/data/profile-limits'
import { selfProfile, type ChartProfile } from '@/data/profiles'
import { hasActivePlan } from '@/onboarding/past-intro'
import { ProfilesContext, type NewProfile, type ProfilesApi } from './profiles-context'
import { loadProfiles, loadSelected, saveProfiles, saveSelected } from './storage'

/**
 * Owns the saved charts and which one is being read.
 *
 * The selection lives here rather than inside the chart dashboard, so
 * switching to your mother's chart and then opening Matching or a horoscope
 * keeps reading her chart — the thing that made it page-local state a bug.
 *
 * `self` is assembled from the auth user on every render rather than stored,
 * so editing birth details updates it without a second write.
 */
export function ProfilesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id

  const [saved, setSaved] = useState<ChartProfile[]>([])
  const [selectedId, setSelectedId] = useState('self')

  // Load (or clear) this account's charts whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) {
      setSaved([])
      setSelectedId('self')
      return
    }
    setSaved(loadProfiles(userId) ?? [])
    setSelectedId(loadSelected(userId))
  }, [userId])

  const persist = useCallback(
    (next: ChartProfile[]) => {
      setSaved(next)
      if (userId) saveProfiles(userId, next)
    },
    [userId],
  )

  const profiles = useMemo<ChartProfile[]>(
    () => (user ? [selfProfile(user.fullName, user.birthDetails), ...saved] : saved),
    [user, saved],
  )

  const selected =
    profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? selfProfile('You', {
      fullName: 'You',
      date: '2000-01-01',
      time: '12:00',
      timeUnknown: true,
      place: {
        label: 'New Delhi, Delhi NCR',
        latitude: 28.6139,
        longitude: 77.209,
        timeZone: 'Asia/Kolkata',
      },
    })

  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      if (userId) saveSelected(userId, id)
    },
    [userId],
  )

  const planUnlocked = Boolean(userId && hasActivePlan(userId))
  const canAdd = canAddAdditionalProfile(saved.length, planUnlocked)

  const add = useCallback(
    (profile: NewProfile) => {
      if (!canAddAdditionalProfile(saved.length, Boolean(userId && hasActivePlan(userId)))) {
        throw new Error('Free accounts can save two additional profiles. Upgrade to add more.')
      }
      const created: ChartProfile = {
        id: `pr_${Date.now().toString(36)}`,
        name: profile.name,
        relation: profile.relation === 'self' ? 'family' : profile.relation,
        note: profile.note,
        birthDetails: profile.birthDetails,
      }
      persist([...saved, created])
      return created
    },
    [saved, persist, userId],
  )

  const update = useCallback(
    (id: string, patch: Partial<NewProfile>) => {
      persist(
        saved.map((profile) => {
          if (profile.id !== id) return profile
          return {
            ...profile,
            name: patch.name ?? profile.name,
            relation: patch.relation ?? profile.relation,
            note: patch.note !== undefined ? patch.note : profile.note,
            birthDetails: patch.birthDetails ?? profile.birthDetails,
          }
        }),
      )
    },
    [saved, persist],
  )

  const remove = useCallback(
    (id: string) => {
      persist(saved.filter((profile) => profile.id !== id))
      if (selectedId === id) select('self')
    },
    [saved, persist, selectedId, select],
  )

  const value = useMemo<ProfilesApi>(
    () => ({
      profiles,
      saved,
      selectedId: selected.id,
      selected,
      select,
      add,
      update,
      remove,
      additionalCount: saved.length,
      freeAdditionalLimit: FREE_ADDITIONAL_PROFILES,
      canAddAdditional: canAdd,
    }),
    [profiles, saved, selected, select, add, update, remove, canAdd],
  )

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}
