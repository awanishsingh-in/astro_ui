import type { ReactNode } from 'react'

/** Every async surface in the app moves through these four states. */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data?: T
  error?: AppError
}

/** A shaped error so ErrorState can render a retry without guessing. */
export interface AppError {
  message: string
  /** Machine code from the API layer, e.g. "NETWORK", "NOT_FOUND". */
  code?: string
  retryable?: boolean
}

export type Size = 'sm' | 'md' | 'lg'

export type Tone = 'neutral' | 'navy' | 'gold' | 'positive' | 'caution' | 'critical'

export interface TabItem {
  id: string
  label: string
  /** Optional count badge, e.g. reading counts per bhava. */
  count?: number
  disabled?: boolean
}

export interface NavItem {
  id: string
  label: string
  to: string
  icon: ReactNode
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  /** Secondary line, e.g. a varga's "marriage, real strength". */
  description?: string
  disabled?: boolean
}
