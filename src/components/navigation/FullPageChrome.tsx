import { ArrowLeft } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ProfilePillStrip } from '@/components/account/ProfilePillStrip'
import { Logo } from '@/components/brand/Logo'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { useToast } from '@/components/feedback/toast-context'
import { useProfiles } from '@/profiles/profiles-context'
import { paths } from '@/routes/paths'
import type { User } from '@/types/user'
import { requestAvatarMenuReopen } from '@/utils/avatar-menu'
import { cn } from '@/utils/cn'

/** Session flag so Family → Profile can pulse the dashed + in the top chrome. */
export const HIGHLIGHT_ADD_PROFILE_KEY = 'cyklos_highlight_add_profile'

/** Dispatched while the Add profile form is open — chrome hides existing pills. */
export const ADD_FORM_VISIBILITY_EVENT = 'cyklos-add-form-visibility'

export function setAddFormVisibleInChrome(open: boolean) {
  window.dispatchEvent(
    new CustomEvent(ADD_FORM_VISIBILITY_EVENT, { detail: { open } }),
  )
}

export interface FullPageChromeProps {
  user: User
  /** Optional trailing control — e.g. chart profile picker. */
  action?: ReactNode
  className?: string
}

/**
 * Top bar for immersive routes (My Chart, Your Past, Profile): back + Cyklos mark,
 * no side nav. On Profile, the name pills and dashed + sit beside the logo.
 */
export function FullPageChrome({ user, action, className }: FullPageChromeProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const profiles = useProfiles()
  const onProfile = location.pathname === paths.profile
  const [highlightAdd, setHighlightAdd] = useState(false)
  const [hideProfiles, setHideProfiles] = useState(false)

  useEffect(() => {
    if (!onProfile) {
      setHideProfiles(false)
      return
    }

    const pulse = () => {
      setHighlightAdd(true)
      window.setTimeout(() => setHighlightAdd(false), 2800)
    }

    const fromStorage = () => {
      try {
        if (sessionStorage.getItem(HIGHLIGHT_ADD_PROFILE_KEY) !== '1') return false
        sessionStorage.removeItem(HIGHLIGHT_ADD_PROFILE_KEY)
        return true
      } catch {
        return false
      }
    }

    if (fromStorage()) pulse()

    const onPulse = () => pulse()
    const onFormVisibility = (event: Event) => {
      const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open)
      setHideProfiles(open)
      if (open) setHighlightAdd(true)
    }

    window.addEventListener('cyklos-highlight-add', onPulse)
    window.addEventListener(ADD_FORM_VISIBILITY_EVENT, onFormVisibility)
    return () => {
      window.removeEventListener('cyklos-highlight-add', onPulse)
      window.removeEventListener(ADD_FORM_VISIBILITY_EVENT, onFormVisibility)
    }
  }, [onProfile, location.key, params])

  const goBack = () => {
    if (onProfile) requestAvatarMenuReopen()

    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(paths.ask)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/80',
        'bg-surface/90 px-3 backdrop-blur-md sm:px-5',
        className,
      )}
    >
      <button
        type="button"
        onClick={goBack}
        className={cn(
          'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-control px-2 py-1.5',
          'text-sm font-medium text-purple transition-colors',
          'hover:bg-navy-soft hover:text-ink',
        )}
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Back</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Logo size="sm" className="pointer-events-none shrink-0" />

        {onProfile && (
          <div id="profiles-strip" className="min-w-0 flex-1 scroll-mt-20">
            <ProfilePillStrip
              profiles={profiles.profiles}
              selectedId={profiles.selectedId}
              selfPhotoUrl={user.photoUrl}
              compact
              hideProfiles={hideProfiles}
              onSelect={(profile) => {
                profiles.select(profile.id)
                toast.success(
                  profile.id === 'self'
                    ? 'Now reading your chart'
                    : `Now reading ${profile.name}’s chart`,
                )
              }}
              onEdit={(profile) => {
                setParams(
                  (prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('edit', profile.id)
                    return next
                  },
                  { replace: true },
                )
              }}
              onAdd={() => {
                setParams(
                  (prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('add', '1')
                    return next
                  },
                  { replace: false },
                )
              }}
              highlightAdd={highlightAdd}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        {!onProfile && <AvatarMenu user={user} size="sm" />}
      </div>
    </header>
  )
}
