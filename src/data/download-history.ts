/**
 * App-wide download history — panchang, kundali, reports, calendar files.
 * Persisted in localStorage for this demo account.
 */

export type DownloadKind =
  | 'panchang'
  | 'kundali'
  | 'report'
  | 'calendar'
  | 'muhurat'
  | 'other'

export interface DownloadHistoryItem {
  id: string
  kind: DownloadKind
  title: string
  subtitle: string
  filename: string
  createdAt: string
}

const STORAGE_KEY = 'cyklos_download_history'

const SEED: DownloadHistoryItem[] = [
  {
    id: 'dl-seed-1',
    kind: 'kundali',
    title: 'Basic Kundali PDF',
    subtitle: 'Your chart · D-1 Rashi',
    filename: 'cyklos-kundali-self.pdf',
    createdAt: '2026-10-08T11:20:00.000Z',
  },
  {
    id: 'dl-seed-2',
    kind: 'panchang',
    title: 'Panchang day sheet',
    subtitle: 'Delhi · 19 Sep 2026',
    filename: 'cyklos-panchang-delhi-2026-09-19.pdf',
    createdAt: '2026-09-19T08:05:00.000Z',
  },
  {
    id: 'dl-seed-3',
    kind: 'report',
    title: 'Career report',
    subtitle: 'Full reading PDF',
    filename: 'cyklos-report-career.pdf',
    createdAt: '2026-09-12T16:40:00.000Z',
  },
  {
    id: 'dl-seed-4',
    kind: 'calendar',
    title: 'Festival reminders',
    subtitle: 'Calendar · .ics',
    filename: 'cyklos-festivals-2026.ics',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
]

function sortNewest(items: DownloadHistoryItem[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function loadDownloadHistory(): DownloadHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
      return sortNewest(SEED)
    }
    const parsed = JSON.parse(raw) as DownloadHistoryItem[]
    if (!Array.isArray(parsed)) return sortNewest(SEED)
    return sortNewest(parsed)
  } catch {
    return sortNewest(SEED)
  }
}

export function getDownloadById(id: string): DownloadHistoryItem | undefined {
  return loadDownloadHistory().find((item) => item.id === id)
}

export function downloadFileExtension(item: DownloadHistoryItem): string {
  const match = /\.([a-z0-9]+)$/i.exec(item.filename)
  return match?.[1]?.toUpperCase() ?? 'FILE'
}

export function downloadKindDescription(kind: DownloadKind): string {
  switch (kind) {
    case 'panchang':
      return 'Daily Hindu calendar sheet — tithi, nakshatra, yoga, and day timings for your place.'
    case 'kundali':
      return 'Birth chart export — houses, planets, and lagna details saved for offline reading.'
    case 'report':
      return 'Paid reading PDF — topic chapters and recommendations from your chart.'
    case 'calendar':
      return 'Calendar file (.ics) — import into Google Calendar, Apple Calendar, or Outlook.'
    case 'muhurat':
      return 'Auspicious timing sheet — windows scored for your chosen purpose.'
    default:
      return 'A file saved from Cyklos. Open it again or download a fresh copy anytime.'
  }
}

export function recordDownload(
  entry: Omit<DownloadHistoryItem, 'id' | 'createdAt'> & {
    id?: string
    createdAt?: string
  },
): DownloadHistoryItem {
  const item: DownloadHistoryItem = {
    id: entry.id ?? `dl-${Date.now()}`,
    kind: entry.kind,
    title: entry.title,
    subtitle: entry.subtitle,
    filename: entry.filename,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  }
  try {
    const next = sortNewest([item, ...loadDownloadHistory()])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable — history lasts for this session only via return value.
  }
  try {
    window.dispatchEvent(new CustomEvent(DOWNLOAD_RECORDED_EVENT, { detail: item }))
  } catch {
    /* SSR / private */
  }
  return item
}

export function downloadKindLabel(kind: DownloadKind): string {
  switch (kind) {
    case 'panchang':
      return 'Panchang'
    case 'kundali':
      return 'Kundali'
    case 'report':
      return 'Report'
    case 'calendar':
      return 'Calendar'
    case 'muhurat':
      return 'Muhurat'
    default:
      return 'File'
  }
}

/** Fired after every recorded download so open panels can refresh. */
export const DOWNLOAD_RECORDED_EVENT = 'cyklos-download-recorded'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

/** Minimal single-page PDF from plain lines (demo — no external library). */
function linesToPdfBlob(lines: string[]): Blob {
  const contentLines = [
    'BT',
    '/F1 11 Tf',
    '50 780 Td',
    '14 TL',
    ...lines.flatMap((line, index) => {
      const safe = escapePdfText(line)
      if (index === 0) return [`(${safe}) Tj`]
      return ['T*', `(${safe}) Tj`]
    }),
    'ET',
  ]
  const stream = contentLines.join('\n')
  const objects = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n',
    `4 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(pdf.length)
    pdf += object
  }
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

function buildHistoryBlob(item: DownloadHistoryItem): { blob: Blob; openInTab: boolean } {
  const lower = item.filename.toLowerCase()
  const isIcs = lower.endsWith('.ics') || item.kind === 'calendar'
  const isPdf = lower.endsWith('.pdf') || item.kind === 'panchang' || item.kind === 'report'

  if (isIcs) {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cyklos//Downloads//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${item.title}`,
      `DESCRIPTION:${item.subtitle}`,
      `DTSTAMP:${item.createdAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      'DTSTART;VALUE=DATE:20260901',
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n')
    return {
      blob: new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
      openInTab: false,
    }
  }

  if (isPdf) {
    return {
      blob: linesToPdfBlob([
        'Cyklos',
        item.title,
        item.subtitle,
        '',
        `File · ${item.filename}`,
        `Saved · ${item.createdAt.slice(0, 10)}`,
        '',
        'Reopened from your download history.',
        'Demo content — the live file ships with full tables.',
      ]),
      openInTab: true,
    }
  }

  const text = [
    'Cyklos',
    item.title,
    item.subtitle,
    '',
    `File · ${item.filename}`,
    `Saved · ${item.createdAt.slice(0, 10)}`,
    '',
    'Reopened from your download history.',
  ].join('\n')
  return {
    blob: new Blob([text], { type: 'text/plain;charset=utf-8' }),
    openInTab: true,
  }
}

/**
 * Open or re-download a history item so the user can see the file again.
 * PDFs / text open in a new tab; calendar files download.
 */
export function openHistoryFile(item: DownloadHistoryItem): 'opened' | 'downloaded' {
  const { blob, openInTab } = buildHistoryBlob(item)
  const url = URL.createObjectURL(blob)

  if (openInTab) {
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (win) {
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      return 'opened'
    }
  }

  const link = document.createElement('a')
  link.href = url
  link.download = item.filename
  link.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
