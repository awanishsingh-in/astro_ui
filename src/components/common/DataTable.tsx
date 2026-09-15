import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface DataColumn<T> {
  id: string
  /** Short mono header, e.g. "Gr", "Rashi", "Degree". */
  header: string
  render: (row: T, index: number) => ReactNode
  align?: 'left' | 'right' | 'center'
  /** Hide on mobile where width is scarce. */
  hideBelow?: 'md' | 'lg'
  width?: string
}

export interface DataTableProps<T> {
  caption: string
  columns: DataColumn<T>[]
  rows: T[]
  rowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  /** Row appears selected, e.g. a graha cited by the open reading. */
  isRowActive?: (row: T) => boolean
  className?: string
}

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' } as const
const HIDE = { md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' } as const

/**
 * The chart tables — grahas, bhavas, drishti, ashtakavarga — all render through
 * this, so their type, alignment and row rhythm are identical everywhere.
 * Wide tables scroll inside their own container; the page never scrolls sideways.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  onRowClick,
  isRowActive,
  className,
}: DataTableProps<T>) {
  // `relative` contains any `sr-only` (absolutely positioned) content, so a
  // wide table cannot widen the page beyond its own scroller.
  return (
    <div className={cn('relative -mx-1 min-w-0 overflow-x-auto px-1', className)}>
      <table className="w-full min-w-max">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  'whitespace-nowrap px-2.5 pb-2 font-mono text-label font-medium uppercase text-muted',
                  ALIGN[column.align ?? 'left'],
                  column.hideBelow && HIDE[column.hideBelow],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const active = isRowActive?.(row) ?? false
            return (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-border last:border-b-0',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-navy-soft',
                  active && 'bg-gold-soft',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'whitespace-nowrap px-2.5 py-3 text-sm text-ink',
                      ALIGN[column.align ?? 'left'],
                      column.hideBelow && HIDE[column.hideBelow],
                    )}
                  >
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
