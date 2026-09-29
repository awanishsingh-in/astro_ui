import AeroShards from '@/components/celestial/AeroShards'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

/**
 * Know Your Past sky — AeroShards WebGPU field behind the editorial UI.
 * Falls back to a solid midnight wash if WebGPU fails.
 */
export function PastAeroSky({
  className,
  children,
  contentClassName,
}: {
  className?: string
  children: ReactNode
  contentClassName?: string
}) {
  return (
    <div className={cn('relative isolate overflow-hidden bg-[#07041a]', className)}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <AeroShards
          backgroundColor="#07041a"
          shardColor="#7c4dff"
          accentColor="#5ed7f2"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
        />
      </div>
      {/* Soft veil so cards and type stay readable over the sculpture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(7,4,26,0.22)_0%,rgba(11,7,28,0.62)_70%,rgba(11,7,28,0.88)_100%)]"
      />
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </div>
  )
}
