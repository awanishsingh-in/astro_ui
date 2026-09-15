import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/auth-context'
import { savedProfiles as seedProfiles, selfProfile, type ChartProfile } from '@/data/profiles'
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

  // Read synchronously, seeding on first run so a new account has examples.
  const [saved, setSaved] = useState<ChartProfile[]>(() => loadProfiles() ?? seedProfiles)
  const [selectedId, setSelectedId] = useState<string>(() => loadSelected())

  const persist = useCallback((next: ChartProfile[]) => {
    setSaved(next)
    saveProfiles(next)
  }, [])

  const profiles = useMemo<ChartProfile[]>(
    () => (user ? [selfProfile(user.fullName, user.birthDetails), ...saved] : saved),
    [user, saved],
  )

  // A deleted profile must not leave the app reading a chart that is gone.
  const selected =
    profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? seedProfiles[0]

  const select = useCallback((id: string) => {
    setSelectedId(id)
    saveSelected(id)
  }, [])

  const add = useCallback(
    (profile: NewProfile) => {
      const created: ChartProfile = {
        id: `pr_${Date.now().toString(36)}`,
        name: profile.name,
        relation: profile.relation,
        note: profile.note,
        birthDetails: profile.birthDetails,
      }
      persist([...saved, created])
      return created
    },
    [saved, persist],
  )

  const update = useCallback(
    (id: string, patch: Partial<NewProfile>) => {
      persist(saved.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)))
    },
    [saved, persist],
  )

  const remove = useCallback(
    (id: string) => {
      persist(saved.filter((profile) => profile.id !== id))
      // Fall back to the account holder's own chart.
      if (selectedId === id) select('self')
    },
    [saved, persist, selectedId, select],
  )

  const value = useMemo<ProfilesApi>(
    () => ({ profiles, saved, selectedId: selected.id, selected, select, add, update, remove }),
    [profiles, saved, selected, select, add, update, remove],
  )

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>
}
