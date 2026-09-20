/**
 * Minimal printable panchang PDF for the Downloads tab (demo, no external library).
 */

export type PanchangDownloadRange = 'day' | 'week' | 'month' | 'year'

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

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

function rangeLabel(range: PanchangDownloadRange) {
  switch (range) {
    case 'day':
      return 'day'
    case 'week':
      return 'week'
    case 'month':
      return 'month'
    case 'year':
      return 'year'
  }
}

export function panchangFilename(
  citySlug: string,
  range: PanchangDownloadRange,
  dateIso: string,
) {
  const month = dateIso.slice(5, 7)
  const year = dateIso.slice(0, 4)
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const mon = monthNames[Number(month) - 1] ?? 'sep'
  if (range === 'day') return `panchang-${citySlug}-${dateIso}.pdf`
  if (range === 'week') return `panchang-${citySlug}-week-${dateIso}.pdf`
  if (range === 'month') return `panchang-${citySlug}-${mon}-${year}.pdf`
  return `panchang-${citySlug}-${year}.pdf`
}

export function downloadPanchangPdf({
  place,
  dateIso,
  range,
}: {
  place: string
  dateIso: string
  range: PanchangDownloadRange
}) {
  const citySlug = place.split(',')[0]?.trim().toLowerCase().replace(/\s+/g, '-') || 'delhi'
  const filename = panchangFilename(citySlug, range, dateIso)
  const lines = [
    'Cyklos — Panchang',
    place,
    `Range: ${rangeLabel(range)}`,
    `Date: ${dateIso}`,
    '',
    'Tithi · Nakshatra · Yoga · Karana',
    'Sunrise / Sunset · Rahu kaal',
    '',
    'Demo sheet — full tables ship with live ephemeris.',
  ]
  const blob = linesToPdfBlob(lines)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  return filename
}
