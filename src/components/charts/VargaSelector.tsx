import { Chip, ChipGroup } from '@/components/common/Chip'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { primaryVargas, vargas } from '@/data/vargas'
import type { Varga, VargaCode } from '@/types/astrology'
import { cn } from '@/utils/cn'

export interface VargaSelectorProps {
  value: VargaCode
  onChange: (varga: VargaCode) => void
  className?: string
}

/** `D1` → `D-1`, which is how the charts are written everywhere else. */
export function vargaLabel(code: VargaCode): string {
  return code.replace('D', 'D-')
}

/**
 * Sixteen divisional charts without sixteen chips.
 *
 * Only the three that get read daily sit in the rail; the rest live behind
 * "All 16", which opens a sheet on mobile and a modal on desktop. A chart
 * picked from there joins the rail so it is one tap away afterwards.
 */
export function VargaSelector({ value, onChange, className }: VargaSelectorProps) {
  const picker = useDisclosure()
  const isDesktop = useIsDesktop()

  const inRail =
    primaryVargas.some((v) => v.code === value)
      ? primaryVargas
      : [...primaryVargas, vargas.find((v) => v.code === value)!]

  const choose = (code: VargaCode) => {
    onChange(code)
    picker.close()
  }

  const grid = (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5" aria-label="Divisional charts">
      {vargas.map((varga) => (
        <li key={varga.code}>
          <VargaRow varga={varga} active={varga.code === value} onSelect={choose} />
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <div
        className={cn(
          'rounded-panel border border-border/70 bg-surface/50 px-3 py-2.5 sm:px-3.5',
          className,
        )}
      >
        <ChipGroup label="Divisional chart">
          {inRail.map((varga) => (
            <Chip
              key={varga.code}
              mono
              selected={varga.code === value}
              onClick={() => onChange(varga.code)}
            >
              {vargaLabel(varga.code)} {varga.name}
            </Chip>
          ))}
          <Chip onClick={picker.open} aria-haspopup="dialog">
            All 16 ⌄
          </Chip>
        </ChipGroup>
      </div>

      {isDesktop ? (
        <Modal
          isOpen={picker.isOpen}
          onClose={picker.close}
          title="Choose a chart"
          description="The rashi chart first; the divisionals refine what it already shows."
          size="lg"
          className="max-w-3xl"
        >
          {grid}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={picker.isOpen}
          onClose={picker.close}
          title="Choose a chart"
          description="The rashi chart first; the divisionals refine what it already shows."
        >
          {grid}
        </BottomSheet>
      )}
    </>
  )
}

function VargaRow({
  varga,
  active,
  onSelect,
}: {
  varga: Varga
  active: boolean
  onSelect: (code: VargaCode) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(varga.code)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex h-full min-h-[4.75rem] w-full flex-col items-start gap-1 rounded-2xl border p-3 text-left',
        'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
        'active:scale-[0.99]',
        active
          ? 'border-copper/55 bg-copper/12'
          : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
      )}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="font-mono text-data text-ink">
          {vargaLabel(varga.code)} {varga.name}
        </span>
        {active && (
          <span className="shrink-0 font-mono text-label uppercase text-copper">On</span>
        )}
      </span>
      <span className="line-clamp-2 text-xs leading-snug text-muted text-pretty">
        {varga.signifies}
      </span>
    </button>
  )
}
