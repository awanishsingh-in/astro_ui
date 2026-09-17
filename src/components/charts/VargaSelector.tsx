import { Chip, ChipGroup } from '@/components/common/Chip'
import { Modal } from '@/components/modals/Modal'
import { BottomSheet } from '@/components/sheets/BottomSheet'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { primaryVargas, secondaryVargas, vargas } from '@/data/vargas'
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
    <div className="space-y-6">
      <section className="space-y-2.5">
        <h3 className="font-mono text-label uppercase text-muted">Used most</h3>
        <ul className="space-y-2">
          {primaryVargas.map((varga) => (
            <li key={varga.code}>
              <VargaRow varga={varga} active={varga.code === value} onSelect={choose} />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2.5">
        <h3 className="font-mono text-label uppercase text-muted">All divisional charts</h3>
        <ul className="space-y-2">
          {secondaryVargas.map((varga) => (
            <li key={varga.code}>
              <VargaRow varga={varga} active={varga.code === value} onSelect={choose} />
            </li>
          ))}
        </ul>
      </section>
    </div>
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
          size="sm"
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
        'flex min-h-14 w-full items-center justify-between gap-3 rounded-card border p-3 text-left',
        'transition-[border-color,background-color,transform] duration-150 ease-out-soft',
        'active:scale-[0.99]',
        active
          ? 'border-copper/55 bg-copper/12'
          : 'border-border bg-surface hover:border-border-strong hover:bg-navy-soft',
      )}
    >
      <span className="min-w-0">
        <span className="block font-mono text-data text-ink">
          {vargaLabel(varga.code)} {varga.name}
        </span>
        <span className="block truncate text-sm text-muted">{varga.signifies}</span>
      </span>
      {active && (
        <span className="shrink-0 font-mono text-label uppercase text-copper">On</span>
      )}
    </button>
  )
}
