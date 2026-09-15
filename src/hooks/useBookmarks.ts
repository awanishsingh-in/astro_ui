import { useCallback, useEffect, useState } from 'react'

const KEY = 'cyklos.bookmarks'

/** Storage is unavailable in private mode and some embeds — never let it throw. */
function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function write(ids: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // The set simply does not survive a reload.
  }
}

/**
 * Saved readings, kept in `localStorage`.
 *
 * A `storage` listener keeps two open tabs in step, and every hook instance
 * subscribes to a module-level set so the card list and the detail page agree
 * the moment either one toggles.
 */
const listeners = new Set<(ids: string[]) => void>()

function broadcast(ids: string[]): void {
  write(ids)
  listeners.forEach((notify) => notify(ids))
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>(read)

  useEffect(() => {
    listeners.add(setIds)
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) setIds(read())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(setIds)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const isSaved = useCallback((id: string) => ids.includes(id), [ids])

  /** Returns the state it moved to, so the caller can word its feedback. */
  const toggle = useCallback((id: string) => {
    const current = read()
    const next = current.includes(id)
      ? current.filter((existing) => existing !== id)
      : [...current, id]
    broadcast(next)
    return next.includes(id)
  }, [])

  return { ids, isSaved, toggle }
}
