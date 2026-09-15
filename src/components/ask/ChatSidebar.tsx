import { History, MessageSquarePlus, Trash2, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/format'

export interface ChatHistoryItem {
  id: string
  title: string
  updatedAt: string
  /** Optional subtitle, e.g. bhava citation. */
  meta?: string
}

export interface ChatSidebarProps {
  items: ChatHistoryItem[]
  activeId: string | null
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete?: (id: string) => void
  /**
   * Desktop: when true, only New chat + History tab show.
   * Click History to expand the list panel.
   */
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

/**
 * Ask history rail — New chat always available; history opens from a tab.
 */
export function ChatSidebar({
  items,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
  collapsed = false,
  onToggleCollapse,
  className,
}: ChatSidebarProps) {
  const historyOpen = !collapsed

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface',
        historyOpen ? 'w-full lg:w-[280px] xl:w-[300px]' : 'w-auto',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 border-b border-border px-3 py-3',
          !historyOpen && 'flex-col border-b-0 px-2',
        )}
      >
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-control transition-colors',
            historyOpen
              ? 'min-h-11 flex-1 border border-border-strong bg-navy-soft/60 px-3 text-sm font-semibold text-ink hover:border-gold/40 hover:bg-navy-soft'
              : 'size-10 bg-navy text-on-celestial hover:bg-navy-hover',
          )}
          aria-label={historyOpen ? undefined : 'New chat'}
        >
          <MessageSquarePlus
            className={cn('size-4 shrink-0', historyOpen ? 'text-gold-deep' : undefined)}
          />
          {historyOpen && <span>New chat</span>}
        </button>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={historyOpen}
            aria-label={historyOpen ? 'Hide chat history' : 'Show chat history'}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-control transition-colors',
              historyOpen
                ? 'size-11 shrink-0 text-muted hover:bg-navy-soft hover:text-ink'
                : cn(
                    'h-10 w-10 flex-col gap-0.5 text-[9px] font-mono uppercase tracking-[0.08em]',
                    'bg-navy-soft/70 text-purple hover:bg-navy-soft hover:text-ink',
                  ),
            )}
          >
            {historyOpen ? (
              <X className="size-4" />
            ) : (
              <>
                <History className="size-4 text-gold-deep" />
                <span className="leading-none">History</span>
              </>
            )}
          </button>
        )}
      </div>

      {historyOpen && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-2 py-3">
            <p className="px-2 pb-2 font-mono text-label uppercase tracking-wide text-muted">
              Chat history
            </p>

            {items.length === 0 ? (
              <p className="px-2 py-6 text-sm text-muted text-pretty">
                Your conversations will appear here.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = item.id === activeId
                  return (
                    <li key={item.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={cn(
                          'flex w-full flex-col gap-0.5 rounded-control px-3 py-2.5 text-left',
                          'transition-colors duration-150',
                          active
                            ? 'bg-navy-soft text-ink'
                            : 'text-purple hover:bg-navy-soft/70 hover:text-ink',
                        )}
                      >
                        <span className="line-clamp-2 text-sm font-medium text-pretty">
                          {item.title}
                        </span>
                        <span className="font-mono text-label uppercase text-muted">
                          {formatDateShort(item.updatedAt)}
                          {item.meta ? ` · ${item.meta}` : ''}
                        </span>
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          aria-label={`Delete ${item.title}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(item.id)
                          }}
                          className={cn(
                            'absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-xs',
                            'text-faint opacity-0 transition-opacity group-hover:opacity-100',
                            'hover:bg-critical-soft hover:text-critical',
                          )}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
