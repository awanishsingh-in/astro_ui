import { Bookmark, Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'
import { IconButton } from '@/components/common/IconButton'
import { useToast } from '@/components/feedback/toast-context'
import { useBookmarks } from '@/hooks/useBookmarks'
import { paths } from '@/routes/paths'
import type { Reading } from '@/types/readings'
import { cn } from '@/utils/cn'
import { copyText } from '@/utils/clipboard'
import { bhavaRef, GRAHAS } from '@/utils/astro'
import { formatDateShort } from '@/utils/format'

export interface ReadingActionsProps {
  reading: Reading
  className?: string
}

/**
 * Copy, share and save — the three things a reading is actually used for.
 *
 * Deliberately no likes, no comments, no counts: a reading is a private
 * answer about one person's chart, and nothing here turns it into a feed.
 */
export function ReadingActions({ reading, className }: ReadingActionsProps) {
  const toast = useToast()
  const { isSaved, toggle } = useBookmarks()
  const [copied, setCopied] = useState(false)

  const saved = isSaved(reading.id)

  /** The reading as plain text, with its citation — what makes it worth copying. */
  const asText = () => {
    const { answer } = reading
    return [
      reading.question,
      '',
      answer.verdict,
      '',
      answer.reason,
      '',
      ...answer.points.map((point) => `— ${point}`),
      '',
      `Read from: ${[
        answer.source.bhava !== undefined ? bhavaRef(answer.source.bhava) : null,
        answer.source.grahas.map((g) => GRAHAS[g].english).join(', '),
        answer.source.dashaPath,
      ]
        .filter(Boolean)
        .join(' · ')}`,
      answer.window
        ? `Window: ${formatDateShort(answer.window.start)} – ${formatDateShort(answer.window.end)}`
        : null,
      '',
      `What this does not show: ${answer.limits}`,
      '',
      'Calculated by Cyklos from a birth chart.',
    ]
      .filter((line) => line !== null)
      .join('\n')
  }

  const copy = async () => {
    if (await copyText(asText())) {
      setCopied(true)
      toast.success('Reading copied')
      window.setTimeout(() => setCopied(false), 2000)
      return
    }
    toast.error('Could not copy', { description: 'Your browser blocked clipboard access.' })
  }

  const share = async () => {
    const url = `${window.location.origin}${paths.reading(reading.id)}`

    // The platform sheet where there is one; a copied link everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title: reading.question, text: reading.answer.verdict, url })
        return
      } catch {
        // Dismissing the share sheet rejects — that is not an error worth reporting.
        return
      }
    }

    if (await copyText(url)) {
      toast.success('Link copied', { description: 'Only you can open it — it needs your account.' })
      return
    }
    toast.error('Could not share', { description: 'Your browser blocked clipboard access.' })
  }

  const save = () => {
    const nowSaved = toggle(reading.id)
    if (nowSaved) toast.success('Saved to your readings')
    else toast.info('Removed from saved')
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <IconButton
        label={copied ? 'Copied' : 'Copy this reading'}
        icon={copied ? <Check /> : <Copy />}
        size="sm"
        onClick={copy}
        className={copied ? 'text-positive' : undefined}
      />
      <IconButton label="Share this reading" icon={<Share2 />} size="sm" onClick={share} />
      <IconButton
        label={saved ? 'Remove from saved' : 'Save this reading'}
        icon={<Bookmark className={saved ? 'fill-current' : undefined} />}
        size="sm"
        onClick={save}
        aria-pressed={saved}
        className={saved ? 'text-gold-deep' : undefined}
      />
    </div>
  )
}
