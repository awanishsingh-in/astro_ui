import { History, MessageCirclePlus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  newChatSessionId,
  setChatSessions,
  titleFromQuestion,
  useChatSessions,
  type ChatSession,
  type ThreadMessage,
} from '@/ask/chat-store'
import { AskMenu } from '@/components/ask/AskMenu'
import {
  AssistantError,
  AssistantMessage,
  AssistantThinking,
  UserMessage,
} from '@/components/ask/ChatMessage'
import { ChatPaywall } from '@/components/ask/ChatPaywall'
import { QuestionComposer } from '@/components/ask/QuestionComposer'
import { Button } from '@/components/common/Button'
import {
  CelestialScene,
  placementsFromChart,
} from '@/components/celestial/CelestialScene'
import { AvatarMenu } from '@/components/navigation/AvatarMenu'
import { MobileHeader } from '@/components/navigation/MobileHeader'
import { useAuth } from '@/auth/auth-context'
import { buildChart } from '@/data/chart-mock'
import { chartSeedFor } from '@/data/profiles'
import { hasActivePlan, unlockPlan } from '@/onboarding/past-intro'
import { useProfiles } from '@/profiles/profiles-context'
import { PageContainer } from '@/layouts/PageContainer'
import { askQuestion } from '@/services/ask.service'
import { toAppError } from '@/services/client'
import { paths } from '@/routes/paths'
import { bhavaRef } from '@/utils/astro'
import { cn } from '@/utils/cn'
import { firstNameOf, greetingFor } from '@/utils/format'
import { useIsDesktop, useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * Ask — conversation with the chart. History lives on /ask/history.
 */
export default function AskPage() {
  const { user } = useAuth()
  const { selected } = useProfiles()
  const seed = chartSeedFor(selected)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const sessions = useChatSessions()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draftMessages, setDraftMessages] = useState<ThreadMessage[]>([])
  const [viewOnly, setViewOnly] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [planActive, setPlanActive] = useState(() => (user ? hasActivePlan(user.id) : false))

  const requestId = useRef(0)
  const lastAsked = useRef<string | null>(null)
  /** Blocks the ?q= deep-link effect after New chat clears the thread. */
  const suppressUrlAsk = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeSession = activeId ? sessions.find((s) => s.id === activeId) : null
  const messages = activeSession ? activeSession.messages : draftMessages
  const inThread = messages.length > 0
  const busy = messages.some((m) => m.role === 'assistant' && m.status === 'thinking')

  const chartPlacements = useMemo(
    () => placementsFromChart(buildChart(seed, 'D1').grahas),
    [seed],
  )

  const setActiveMessages = useCallback(
    (updater: (prev: ThreadMessage[]) => ThreadMessage[]) => {
      if (activeId) {
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? { ...s, messages: updater(s.messages), updatedAt: new Date().toISOString() }
              : s,
          ),
        )
      } else {
        setDraftMessages(updater)
      }
    },
    [activeId],
  )

  useEffect(() => {
    if (inThread) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, inThread])

  const runAsk = useCallback(
    async (question: string, assistantId: string, id: number, sessionId: string | null) => {
      try {
        const reading = await askQuestion(question, seed, selected.birthDetails.date)
        if (id !== requestId.current) return

        const apply = (prev: ThreadMessage[]) =>
          prev.map((m) =>
            m.id === assistantId
              ? ({ id: assistantId, role: 'assistant', status: 'done', reading } as ThreadMessage)
              : m,
          )

        if (sessionId) {
          setChatSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: apply(s.messages),
                    updatedAt: new Date().toISOString(),
                    meta: reading.source.bhava ? bhavaRef(reading.source.bhava) : s.meta,
                  }
                : s,
            ),
          )
        } else {
          setDraftMessages(apply)
        }
      } catch (caught) {
        if (id !== requestId.current) return
        const apply = (prev: ThreadMessage[]) =>
          prev.map((m) =>
            m.id === assistantId
              ? ({
                  id: assistantId,
                  role: 'assistant',
                  status: 'error',
                  question,
                  message: toAppError(caught).message,
                } as ThreadMessage)
              : m,
          )
        if (sessionId) {
          setChatSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, messages: apply(s.messages) } : s)),
          )
        } else {
          setDraftMessages(apply)
        }
      }
    },
    [seed, selected.birthDetails.date],
  )

  const ask = useCallback(
    async (question: string) => {
      if (!user || !planActive) {
        setPaywallOpen(true)
        return
      }

      const trimmed = question.trim()
      if (!trimmed || busy) return

      const id = ++requestId.current
      lastAsked.current = trimmed
      setViewOnly(false)
      setParams({ q: trimmed }, { replace: true })

      const userMsgId = `u_${id}`
      const assistantId = `a_${id}`
      const incoming: ThreadMessage[] = [
        { id: userMsgId, role: 'user', text: trimmed },
        {
          id: assistantId,
          role: 'assistant',
          status: 'thinking',
          label: 'Reading your chart…',
        },
      ]

      let sessionId = activeId

      if (!sessionId) {
        sessionId = newChatSessionId()
        const session: ChatSession = {
          id: sessionId,
          title: titleFromQuestion(trimmed),
          updatedAt: new Date().toISOString(),
          messages: [...draftMessages, ...incoming],
        }
        setChatSessions((prev) => [session, ...prev])
        setActiveId(sessionId)
        setDraftMessages([])
        await runAsk(trimmed, assistantId, id, sessionId)
        return
      }

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                title:
                  s.messages.length === 0 || s.title === 'New chat'
                    ? titleFromQuestion(trimmed)
                    : s.title,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, ...incoming],
              }
            : s,
        ),
      )
      await runAsk(trimmed, assistantId, id, sessionId)
    },
    [busy, setParams, activeId, draftMessages, runAsk, user, planActive],
  )

  const confirmPlan = useCallback(
    (_planId: string) => {
      if (!user) return
      unlockPlan(user.id)
      setPlanActive(true)
      setPaywallOpen(false)
    },
    [user],
  )

  // Deep link / reload with ?q= starts a fresh chat for that question.
  // Skipped after New chat so clearing the URL cannot re-open the old thread.
  const initial = params.get('q')
  const chatParam = params.get('chat')
  const modeParam = params.get('mode')
  const newParam = params.get('new')

  useEffect(() => {
    if (suppressUrlAsk.current) {
      if (!initial) suppressUrlAsk.current = false
      return
    }
    if (!initial || lastAsked.current === initial) return
    if (activeId || draftMessages.length > 0) return
    if (!planActive) {
      setPaywallOpen(true)
      return
    }
    void ask(initial)
  }, [initial, ask, activeId, draftMessages.length, planActive])

  const startNewChat = useCallback(() => {
    suppressUrlAsk.current = true
    requestId.current += 1
    lastAsked.current = null
    setViewOnly(false)
    setParams({}, { replace: true })
    setActiveId(null)
    setDraftMessages([])
  }, [setParams])

  const selectChat = useCallback(
    (id: string, mode: 'view' | 'continue' = 'continue') => {
      requestId.current += 1
      setActiveId(id)
      setDraftMessages([])
      setViewOnly(mode === 'view')
      const session = sessions.find((s) => s.id === id)
      const firstUser = session?.messages.find((m) => m.role === 'user')
      if (firstUser && firstUser.role === 'user') {
        lastAsked.current = firstUser.text
        setParams(
          { chat: id, mode, q: firstUser.text },
          { replace: true },
        )
      } else {
        lastAsked.current = null
        setParams({ chat: id, mode }, { replace: true })
      }
    },
    [sessions, setParams],
  )

  useEffect(() => {
    if (newParam === '1') {
      startNewChat()
      return
    }
    if (!chatParam) return
    if (activeId === chatParam && (modeParam === 'view') === viewOnly) return
    const exists = sessions.some((s) => s.id === chatParam)
    if (!exists) return
    selectChat(chatParam, modeParam === 'view' ? 'view' : 'continue')
  }, [newParam, chatParam, modeParam, sessions, activeId, viewOnly, selectChat, startNewChat])

  const retry = useCallback(
    (question: string) => {
      if (!planActive) {
        setPaywallOpen(true)
        return
      }
      if (busy || viewOnly) return
      const id = ++requestId.current
      const assistantId = `a_${id}`
      setActiveMessages((prev) => [
        ...prev.filter((m) => !(m.role === 'assistant' && m.status === 'error')),
        {
          id: assistantId,
          role: 'assistant',
          status: 'thinking',
          label: 'Reading your chart…',
        },
      ])
      void runAsk(question, assistantId, id, activeId)
    },
    [busy, setActiveMessages, runAsk, activeId, planActive, viewOnly],
  )

  if (!user) return null

  const shellHeight =
    'h-[calc(100dvh-var(--spacing-bottomnav))] lg:h-full lg:max-h-full'

  return (
    <div className={cn('flex overflow-hidden', shellHeight)}>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader
          leading={<AskMenu onNewChat={startNewChat} />}
          user={user}
          action={<AvatarMenu user={user} size="sm" />}
        />

        {!inThread ? (
          <AskEmpty
            onAsk={ask}
            fullName={user.fullName}
            chartName={selected.name}
            relation={selected.relation}
            chartSeed={seed}
            planRequired={!planActive}
          />
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <CelestialScene
              className="opacity-70"
              starSeed="ask-thread"
              placements={chartPlacements}
            />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                <PageContainer width="reading" className="pb-4">
                  <div className="mx-auto flex max-w-reading flex-col gap-6 sm:gap-8">
                    {viewOnly && (
                      <p className="rounded-control border border-border bg-surface/80 px-3 py-2 font-mono text-label uppercase tracking-[0.12em] text-muted">
                        Viewing · read only
                      </p>
                    )}
                    {messages.map((message) => {
                      if (message.role === 'user') {
                        return <UserMessage key={message.id} text={message.text} />
                      }
                      if (message.status === 'thinking') {
                        return <AssistantThinking key={message.id} label={message.label} />
                      }
                      if (message.status === 'error') {
                        return (
                          <AssistantError
                            key={message.id}
                            message={message.message}
                            onRetry={() => retry(message.question)}
                          />
                        )
                      }
                      return (
                        <AssistantMessage key={message.id} reading={message.reading} onAsk={ask} />
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>
                </PageContainer>
              </div>

              <div
                className={cn(
                  'sticky bottom-0 z-20 border-t border-border/80 bg-canvas/90 backdrop-blur-md',
                  'pb-safe',
                )}
              >
                <PageContainer width="reading" flush className="py-3 lg:py-4">
                  <div className="mx-auto max-w-reading">
                    {viewOnly ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="secondary"
                          size="md"
                          fullWidth
                          iconLeft={<History className="size-4" />}
                          onClick={() => navigate(paths.askHistory)}
                          className="sm:flex-1"
                        >
                          History
                        </Button>
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          iconLeft={<MessageCirclePlus className="size-4" />}
                          onClick={() => activeId && selectChat(activeId, 'continue')}
                          className="sm:flex-1"
                        >
                          Continue
                        </Button>
                      </div>
                    ) : (
                      <QuestionComposer
                        variant="bar"
                        onAsk={ask}
                        placeholder={busy ? 'Cyklos is answering…' : 'Ask a follow-up…'}
                        autoFocus={planActive}
                      />
                    )}
                    <p className="mt-2 font-mono text-label uppercase text-muted">
                      From · {selected.name}&apos;s chart
                      {!planActive ? ' · Plan required to chat' : ''}
                    </p>
                  </div>
                </PageContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatPaywall
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlock={confirmPlan}
      />
    </div>
  )
}

function AskEmpty({
  onAsk,
  fullName,
  chartName,
  relation,
  chartSeed,
  planRequired,
}: {
  onAsk: (question: string) => void
  fullName: string
  chartName: string
  relation: string
  chartSeed: string
  planRequired: boolean
}) {
  const firstName = firstNameOf(fullName)
  const desktop = useIsDesktop()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [attentive, setAttentive] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const frame = useRef(0)

  const placements = useMemo(
    () => placementsFromChart(buildChart(chartSeed, 'D1').grahas),
    [chartSeed],
  )

  const onMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!desktop || !finePointer || reduceMotion) return
      const rect = event.currentTarget.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => setParallax({ x: nx, y: ny }))
    },
    [desktop, finePointer, reduceMotion],
  )

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <section
        className="relative isolate flex flex-1 overflow-hidden"
        onMouseMove={onMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(90% 80% at 12% -10%, color-mix(in srgb, var(--color-indigo-royal) 28%, transparent) 0%, transparent 55%), radial-gradient(70% 60% at 88% 10%, color-mix(in srgb, var(--color-gold) 14%, transparent) 0%, transparent 50%)',
          }}
        />
        <CelestialScene
          placements={placements}
          attentive={attentive}
          parallax={parallax}
          starSeed="ask-idle"
        />

        <PageContainer width="content" className="relative z-10 flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-reading flex-1 flex-col justify-end pb-5 pt-4 sm:justify-center sm:py-8 lg:py-10">
            <div className="relative rounded-2xl bg-canvas/40 px-3 py-4 backdrop-blur-[3px] sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
              <p className="animate-rise font-mono text-label uppercase tracking-[0.14em] text-gold-deep">
                Ask your chart
              </p>

              <h1 className="mt-2 animate-rise font-serif text-[2rem] font-normal leading-[1.15] text-ink text-balance sm:text-display lg:text-display-lg [animation-delay:40ms]">
                {greetingFor()}, {firstName}.
                <span className="mt-1 block text-xl text-purple sm:text-title lg:text-title-lg">
                  What would you like to know?
                </span>
              </h1>

              <p className="mt-3 max-w-xl animate-rise text-sm text-purple text-pretty sm:mt-4 sm:text-body [animation-delay:80ms]">
                Answers name the house, planets and period they came from — never a generic
                horoscope.
              </p>
            </div>

            <div className="relative z-10 mt-5 animate-rise sm:mt-8 [animation-delay:120ms]">
              <QuestionComposer
                onAsk={onAsk}
                placeholder="Message Cyklos…"
                autoFocus={desktop}
                onFocusChange={setAttentive}
              />
            </div>

            <p className="relative z-10 mt-3 animate-rise font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:mt-4 sm:text-label [animation-delay:160ms]">
              Reading · {chartName}
              {relation !== 'self' ? ` · ${relation}` : ''}
              {planRequired ? ' · Plan required' : ''}
            </p>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
