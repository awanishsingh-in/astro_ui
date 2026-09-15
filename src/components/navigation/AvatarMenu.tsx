import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ThemeQuickToggle } from '@/components/account/ThemeQuickToggle'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { useToast } from '@/components/feedback/toast-context'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useAuth } from '@/auth/auth-context'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { accountMenu, signOutItem, type AccountMenuItem } from '@/routes/navigation'
import { paths } from '@/routes/paths'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'
import { formatPhone } from '@/utils/format'

export interface AvatarMenuProps {
  user: User
  /** Avatar size — the mobile header runs one notch smaller. */
  size?: 'sm' | 'md'
  /**
   * Desktop dropdown direction. SideNav sits at the bottom of the rail, so it
   * opens upward; headers open downward.
   */
  placement?: 'up' | 'down'
  className?: string
}

/**
 * The only account control in the product, on both breakpoints.
 *
 * Desktop opens a dropdown anchored to the avatar; mobile opens a bottom sheet.
 * The desktop panel is portaled so parent overflow (AppLayout / SideNav) cannot
 * clip it out of view.
 */
export function AvatarMenu({
  user,
  size = 'md',
  placement = 'down',
  className,
}: AvatarMenuProps) {
  const menu = useDisclosure()
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const toast = useToast()
  const { signOut } = useAuth()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const close = menu.close

  useEffect(() => {
    if (!menu.isOpen || !isDesktop) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (wrapperRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menu.isOpen, isDesktop, close])

  // Never leave a portaled panel behind after sign-out / route change.
  useEffect(() => () => close(), [close])

  const updatePosition = useCallback(() => {
    const trigger = wrapperRef.current
    const panel = panelRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const panelWidth = panel?.offsetWidth ?? 256
    const panelHeight = panel?.offsetHeight ?? 320
    const gap = 10

    let left = rect.right - panelWidth
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8))

    let top =
      placement === 'up' ? rect.top - gap - panelHeight : rect.bottom + gap

    if (placement === 'up' && top < 8) {
      top = Math.min(rect.bottom + gap, window.innerHeight - panelHeight - 8)
    } else if (placement === 'down' && top + panelHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - gap - panelHeight)
    }

    setCoords({ top, left })
  }, [placement])

  useLayoutEffect(() => {
    if (!menu.isOpen || !isDesktop) {
      setCoords(null)
      return
    }

    updatePosition()
    const onReposition = () => updatePosition()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [menu.isOpen, isDesktop, updatePosition])

  const select = useCallback(
    (item: AccountMenuItem) => {
      menu.close()

      if (item.id === signOutItem.id) {
        signOut()
        navigate(paths.landing, { replace: true })
        toast.success('Signed out', {
          description: 'Your chart and readings stay saved — sign in with a code.',
        })
        return
      }

      if (item.pending) {
        toast.info(`${item.label} is not built yet`, {
          description: 'It is on the roadmap for this account area.',
        })
        return
      }

      if (item.to) navigate(item.to)
    },
    [menu, navigate, toast, signOut],
  )

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      menu.open()
    }
  }

  const trigger = (
    <button
      type="button"
      onClick={menu.toggle}
      onKeyDown={onTriggerKeyDown}
      aria-haspopup="menu"
      aria-expanded={menu.isOpen}
      aria-label={`Account — ${user.fullName}`}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-full',
        'transition-[opacity,transform] duration-150 ease-out-soft',
        'hover:opacity-80 active:scale-95',
        menu.isOpen && 'ring-2 ring-navy ring-offset-2 ring-offset-surface',
      )}
    >
      <Avatar name={user.fullName} initials={user.initials} size={size} />
    </button>
  )

  const identity = (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
      <Avatar name={user.fullName} initials={user.initials} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-sub font-semibold text-ink">{user.fullName}</p>
        <p className="truncate font-mono text-data text-muted">{formatPhone(user.phone)}</p>
      </div>
    </div>
  )

  const items = (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Appearance</p>
          <p className="text-xs text-muted">Light, dark, or system</p>
        </div>
        <ThemeQuickToggle />
      </div>
      {accountMenu.map((item) => (
        <MenuRow key={item.id} item={item} onSelect={select} />
      ))}
      <div className="my-1 border-t border-border" />
      <MenuRow item={signOutItem} onSelect={select} />
    </>
  )

  if (!isDesktop) {
    return (
      <div className={className}>
        {trigger}
        <BottomSheet
          isOpen={menu.isOpen}
          onClose={menu.close}
          title={user.fullName}
          description={formatPhone(user.phone)}
        >
          <div role="menu" aria-label="Account" className="-mx-1">
            {items}
          </div>
        </BottomSheet>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {trigger}

      {menu.isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label="Account"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation()
                menu.close()
              }
            }}
            style={
              coords
                ? { top: coords.top, left: coords.left }
                : { top: -9999, left: -9999, visibility: 'hidden' }
            }
            className={cn(
              'fixed z-[80] w-64 animate-scale-in',
              placement === 'up' ? 'origin-bottom-right' : 'origin-top-right',
              'overflow-hidden rounded-card border border-border bg-surface shadow-overlay',
            )}
          >
            {identity}
            <div className="max-h-[min(24rem,calc(100dvh-1rem))] overflow-y-auto p-1">
              {items}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function MenuRow({
  item,
  onSelect,
}: {
  item: AccountMenuItem
  onSelect: (item: AccountMenuItem) => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onSelect(item)}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-xs px-3 py-2.5 text-left text-sub',
        'transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0',
        item.tone === 'critical'
          ? 'text-critical hover:bg-critical-soft'
          : 'text-purple hover:bg-navy-soft hover:text-ink',
      )}
    >
      <span aria-hidden className="text-muted">
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.pending && (
        <Badge tone="neutral" mono className="shrink-0">
          Soon
        </Badge>
      )}
      {!item.pending && item.tone !== 'critical' && (
        <ChevronRight aria-hidden className="text-faint" />
      )}
    </button>
  )
}
