import { Eye, History, MessageCircle, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteChatSession,
  useChatSessions,
  type ChatSession,
} from '@/ask/chat-store'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/forms/Input'
import { Modal } from '@/components/modals/Modal'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useAuth } from '@/auth/auth-context'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { PageContainer } from '@/layouts/PageContainer'
import { paths } from '@/routes/paths'
import { cn } from '@/utils/cn'
import { formatDateShort } from '@/utils/format'

function toSummary(session: ChatSession) {
  const firstUser = session.messages.find((message) => message.role === 'user')
  return {
    id: session.id,
    title: session.title,
    updatedAt: session.updatedAt,
    meta: session.meta,
    preview: firstUser && firstUser.role === 'user' ? firstUser.text : session.title,
  }
}

type HistoryItem = ReturnType<typeof toSummary>

/**
 * Chat history — searchable cards with View / Continue.
 */
export default function ChatHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const sessions = useChatSessions()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null)
  const deleteConfirm = useDisclosure()
  const DeleteOverlay = isDesktop ? Modal : BottomSheet

  const items = useMemo(() => sessions.map(toSummary), [sessions])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const haystack = [item.title, item.preview, item.meta ?? ''].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query])

  if (!user) return null

  const openChat = (id: string, mode: 'view' | 'continue') => {
    navigate(`${paths.ask}?chat=${encodeURIComponent(id)}&mode=${mode}`)
  }

  const requestDelete = (item: HistoryItem) => {
    setPendingDelete(item)
    deleteConfirm.open()
  }

  const closeDelete = () => {
    deleteConfirm.close()
    setPendingDelete(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteChatSession(pendingDelete.id)
    closeDelete()
  }

  return (
    <div className="flex h-[calc(100dvh-var(--spacing-bottomnav))] flex-col overflow-hidden lg:h-full">
      <MobileHeader title="History" titleAs="p" user={user} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
        <PageContainer width="reading" className="space-y-5 py-5 sm:py-6 lg:py-8">
          <header className="space-y-2">
            <h1 className="font-serif text-[1.65rem] leading-tight text-ink text-balance sm:text-title lg:text-title-lg">
              Chat history
            </h1>
            <p className="mt-2 max-w-md text-sm text-purple text-pretty sm:text-body">
              Peek at a past answer, or pick up the thread.
            </p>
          </header>

          <div className="space-y-2">
            <label htmlFor="history-search" className="sr-only">
              Search chat history
            </label>
            <Input
              id="history-search"
              type="search"
              inputSize="md"
              tone="sunken"
              icon={<Search strokeWidth={1.75} />}
              placeholder="Search questions, answers, or dates…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
            {query.trim() && items.length > 0 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {filtered.length} match{filtered.length === 1 ? '' : 'es'}
              </p>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<History className="size-6" />}
              title="No chats yet"
              description="Your first question will open a thread here."
              action={
                <Button variant="primary" size="md" onClick={() => navigate(paths.ask)}>
                  Ask your chart
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="size-6" />}
              title="No matches"
              description={`Nothing matched “${query.trim()}”. Try another word.`}
              action={
                <Button variant="secondary" size="md" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3 pb-4">
              {filtered.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    'history-card overflow-hidden rounded-card border border-border bg-surface',
                    'shadow-card animate-rise',
                  )}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex gap-3 p-4 pb-3">
                    <span
                      className={cn(
                        'mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                        'bg-navy-soft text-silver-400',
                      )}
                      aria-hidden
                    >
                      <MessageCircle className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[1.05rem] leading-snug text-ink text-pretty sm:text-lg">
                        {item.title}
                      </p>
                      <p className="history-preview mt-1 line-clamp-2 text-sm leading-snug text-muted text-pretty">
                        {item.preview}
                      </p>
                      <p className="history-meta mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                        {formatDateShort(item.updatedAt)}
                        {item.meta ? ` · ${item.meta}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${item.title}`}
                      onClick={() => requestDelete(item)}
                      className="history-trash inline-flex size-9 shrink-0 items-center justify-center rounded-full text-faint hover:bg-critical-soft hover:text-critical"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="history-actions grid grid-cols-2 gap-px border-t border-border bg-border">
                    <button
                      type="button"
                      onClick={() => openChat(item.id, 'view')}
                      className={cn(
                        'flex min-h-12 items-center justify-center gap-2 bg-surface px-3',
                        'text-sm font-semibold text-silver-300 transition-colors',
                        'active:bg-navy-soft hover:bg-navy-soft/60 hover:text-text',
                      )}
                    >
                      <Eye className="size-4 text-silver-400" aria-hidden />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openChat(item.id, 'continue')}
                      className={cn(
                        'flex min-h-12 items-center justify-center gap-2 bg-surface px-3',
                        'text-sm font-semibold text-silver-300 transition-colors',
                        'active:bg-navy-soft hover:bg-navy-soft/60 hover:text-text',
                      )}
                    >
                      <MessageCircle className="size-4 text-silver-400" aria-hidden />
                      Chat
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PageContainer>
      </div>

      <DeleteOverlay
        isOpen={deleteConfirm.isOpen}
        onClose={closeDelete}
        title="Delete this chat?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from your history. This can’t be undone.`
            : undefined
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="md" onClick={closeDelete}>
              Keep chat
            </Button>
            <Button variant="danger" size="md" onClick={confirmDelete}>
              Delete chat
            </Button>
          </div>
        }
      >
        <p className="text-sm text-purple text-pretty">
          The thread and its answers leave this device. You can always ask again later.
        </p>
      </DeleteOverlay>
    </div>
  )
}
