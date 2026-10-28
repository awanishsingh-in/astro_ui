import { History, Menu, MessageCirclePlus, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SideDrawer } from '@/components/sheets/SideDrawer'
import { useDisclosure } from '@/hooks/useDisclosure'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'

export interface AskMenuProps {
  onNewChat: () => void
  className?: string
}

/**
 * Mobile Ask chrome — hamburger opens a left drawer with chat + catalogue links.
 */
export function AskMenu({ onNewChat, className }: AskMenuProps) {
  const menu = useDisclosure()
  const navigate = useNavigate()
  const [newChatGlow, setNewChatGlow] = useState(false)

  useEffect(() => {
    if (!newChatGlow) return
    const timer = window.setTimeout(() => setNewChatGlow(false), 2400)
    return () => window.clearTimeout(timer)
  }, [newChatGlow])

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={menu.isOpen}
        aria-haspopup="dialog"
        onClick={menu.open}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-control text-ink',
          'transition-colors hover:bg-navy-soft active:scale-95',
        )}
      >
        <Menu className="size-5" strokeWidth={2} aria-hidden />
      </button>

      <SideDrawer
        isOpen={menu.isOpen}
        onClose={menu.close}
        title="Ask"
        description="Chat actions"
      >
        <nav aria-label="Ask menu" className="flex flex-col gap-1">
          <MenuRow
            icon={MessageCirclePlus}
            label="New chat"
            lit={newChatGlow}
            onClick={() => {
              setNewChatGlow(true)
              menu.close()
              onNewChat()
            }}
          />
          <MenuRow
            icon={History}
            label="History"
            onClick={() => {
              menu.close()
              navigate(paths.askHistory)
            }}
          />
        </nav>
      </SideDrawer>
    </div>
  )
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  lit = false,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  lit?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={lit || undefined}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 rounded-control px-3 py-3 text-left',
        'text-sub font-medium transition-[color,background-color,box-shadow] duration-300',
        lit
          ? 'bg-primary/15 text-ink shadow-[0_0_20px_-6px_rgba(201,145,115,0.55)]'
          : 'text-ink hover:bg-navy-soft active:bg-navy-soft/80',
      )}
    >
      <span
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-[color,background-color,box-shadow] duration-300',
          lit
            ? 'bg-primary/25 text-silver-300 shadow-[0_0_16px_-2px_rgba(201,145,115,0.55)]'
            : 'bg-navy-soft text-muted',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  )
}
