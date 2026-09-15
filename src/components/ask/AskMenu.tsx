import { History, Menu, MessageCirclePlus, Telescope, type LucideIcon } from 'lucide-react'
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
        description="Chat and catalogue"
      >
        <nav aria-label="Ask menu" className="flex flex-col gap-1">
          <MenuRow
            icon={MessageCirclePlus}
            label="New chat"
            onClick={() => {
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
          <MenuRow
            icon={Telescope}
            label="All features"
            onClick={() => {
              menu.close()
              navigate(paths.everything)
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
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 rounded-control px-3 py-3 text-left',
        'text-sub font-medium text-ink transition-colors',
        'hover:bg-navy-soft active:bg-navy-soft/80',
      )}
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-soft">
        <Icon className="size-5 text-gold-deep" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  )
}
