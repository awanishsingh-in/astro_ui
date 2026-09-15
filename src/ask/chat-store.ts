import { useSyncExternalStore } from 'react'
import { readings as seedReadings } from '@/data/readings'
import type { Reading } from '@/types/readings'
import { bhavaRef } from '@/utils/astro'

export type ThreadMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; status: 'thinking'; label?: string }
  | { id: string; role: 'assistant'; status: 'done'; reading: Reading }
  | { id: string; role: 'assistant'; status: 'error'; question: string; message: string }

export interface ChatSession {
  id: string
  title: string
  updatedAt: string
  messages: ThreadMessage[]
  meta?: string
}

export interface ChatHistorySummary {
  id: string
  title: string
  updatedAt: string
  meta?: string
  preview: string
}

function readingToSession(reading: Reading): ChatSession {
  return {
    id: reading.id,
    title: reading.question,
    updatedAt: reading.askedAt,
    meta: reading.source.bhava ? bhavaRef(reading.source.bhava) : undefined,
    messages: [
      { id: `${reading.id}_u`, role: 'user', text: reading.question },
      { id: `${reading.id}_a`, role: 'assistant', status: 'done', reading },
    ],
  }
}

function seedSessions(): ChatSession[] {
  return [...seedReadings]
    .sort((a, b) => Date.parse(b.askedAt) - Date.parse(a.askedAt))
    .map(readingToSession)
}

let sessions: ChatSession[] = seedSessions()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getChatSessions(): ChatSession[] {
  return sessions
}

export function subscribeChatSessions(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setChatSessions(
  next: ChatSession[] | ((prev: ChatSession[]) => ChatSession[]),
) {
  sessions = typeof next === 'function' ? next(sessions) : next
  emit()
}

export function getChatSession(id: string): ChatSession | undefined {
  return sessions.find((session) => session.id === id)
}

export function deleteChatSession(id: string) {
  setChatSessions((prev) => prev.filter((session) => session.id !== id))
}

export function chatHistorySummaries(): ChatHistorySummary[] {
  return sessions.map((session) => {
    const firstUser = session.messages.find((message) => message.role === 'user')
    return {
      id: session.id,
      title: session.title,
      updatedAt: session.updatedAt,
      meta: session.meta,
      preview: firstUser && firstUser.role === 'user' ? firstUser.text : session.title,
    }
  })
}

/** Hook into the shared Ask chat session list. */
export function useChatSessions(): ChatSession[] {
  return useSyncExternalStore(subscribeChatSessions, getChatSessions, getChatSessions)
}

export function newChatSessionId() {
  return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function titleFromQuestion(question: string) {
  const trimmed = question.trim()
  return trimmed.length > 56 ? `${trimmed.slice(0, 53)}…` : trimmed
}
