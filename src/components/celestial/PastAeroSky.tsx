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
    <div className={cn('relative isolate overflow-hidden bg-[#120F17]', className)}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#896ABD"
          accentColor="#A855F7"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
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
        />
      </div>
      {/* Soft veil so cards and type stay readable over the sculpture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(18,15,23,0.28)_0%,rgba(18,15,23,0.68)_70%,rgba(18,15,23,0.86)_100%)]"
      />
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </div>
  )
}
