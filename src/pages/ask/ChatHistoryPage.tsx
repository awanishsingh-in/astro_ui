import { Eye, History, MessageCircle, MessageCirclePlus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteChatSession,
  useChatSessions,
  type ChatSession,
} from '@/ask/chat-store'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
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

/**
 * Chat history — mobile-first cards with View / Continue.
 */
export default function ChatHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const sessions = useChatSessions()
  const items = useMemo(() => sessions.map(toSummary), [sessions])

  if (!user) return null

  const openChat = (id: string, mode: 'view' | 'continue') => {
    navigate(`${paths.ask}?chat=${encodeURIComponent(id)}&mode=${mode}`)
  }

  return (
    <div className="flex h-[calc(100dvh-var(--spacing-bottomnav))] flex-col overflow-hidden lg:h-full">
      <MobileHeader
        title="History"
        titleAs="p"
        user={user}
        showBack
        onBack={() => navigate(paths.ask)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
        <PageContainer width="reading" className="space-y-5 py-5 sm:py-6 lg:py-8">
          <header className="space-y-2 lg:flex lg:items-end lg:justify-between lg:gap-6">
            <div className="min-w-0">
              <p className="font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                Your conversations
              </p>
              <h1 className="mt-1 font-serif text-[1.65rem] leading-tight text-ink text-balance sm:text-title lg:text-title-lg">
                Chat history
              </h1>
              <p className="mt-2 max-w-md text-sm text-purple text-pretty sm:text-body">
                Peek at a past answer, or pick up the thread.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              iconLeft={<MessageCirclePlus className="size-4" />}
              onClick={() => navigate(`${paths.ask}?new=1`)}
              className="hidden shrink-0 lg:inline-flex"
            >
              New chat
            </Button>
          </header>

          {/* Mobile new-chat strip */}
          <button
            type="button"
            onClick={() => navigate(`${paths.ask}?new=1`)}
            className={cn(
              'flex w-full items-center gap-3 rounded-card border border-dashed border-gold-border/70',
              'bg-gold-soft/35 px-4 py-3.5 text-left transition-colors active:bg-gold-soft/55',
              'lg:hidden',
            )}
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-on-celestial">
              <MessageCirclePlus className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-lg text-ink">Start a new chat</span>
              <span className="mt-0.5 block text-sm text-muted">Ask anything about your chart</span>
            </span>
          </button>

          {items.length === 0 ? (
            <EmptyState
              icon={<History className="size-6" />}
              title="No chats yet"
              description="Your first question will open a thread here."
              action={
                <Button
                  variant="primary"
                  size="md"
                  iconLeft={<MessageCirclePlus className="size-4" />}
                  onClick={() => navigate(paths.ask)}
                >
                  Ask your chart
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3 pb-4">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    'overflow-hidden rounded-card border border-border bg-surface',
                    'shadow-card animate-rise',
                  )}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex gap-3 p-4 pb-3">
                    <span
                      className={cn(
                        'mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                        'bg-navy-soft text-gold-deep',
                      )}
                      aria-hidden
                    >
                      <MessageCircle className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-[1.05rem] leading-snug text-ink text-pretty sm:text-lg">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted text-pretty">
                        {item.preview}
                      </p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                        {formatDateShort(item.updatedAt)}
                        {item.meta ? ` · ${item.meta}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${item.title}`}
                      onClick={() => deleteChatSession(item.id)}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-faint hover:bg-critical-soft hover:text-critical"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
                    <button
                      type="button"
                      onClick={() => openChat(item.id, 'view')}
                      className={cn(
                        'flex min-h-12 items-center justify-center gap-2 bg-surface px-3',
                        'text-sm font-semibold text-purple transition-colors',
                        'active:bg-navy-soft hover:bg-navy-soft/60 hover:text-ink',
                      )}
                    >
                      <Eye className="size-4 text-gold-deep" aria-hidden />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openChat(item.id, 'continue')}
                      className={cn(
                        'flex min-h-12 items-center justify-center gap-2 bg-surface px-3',
                        'text-sm font-semibold text-navy transition-colors',
                        'active:bg-navy-soft hover:bg-navy-soft/60',
                      )}
                    >
                      <MessageCircle className="size-4 text-gold-deep" aria-hidden />
                      Continue
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PageContainer>
      </div>
    </div>
  )
}
