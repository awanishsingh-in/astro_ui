import { RASHIS } from '@/utils/astro'

const R = 47
const PERIOD = '96s'

/**
 * Outer zodiac markings that drift slower than any planet.
 * SVG so glyph positions stay exact on every orbit size.
 */
export function ZodiacOrbitRing() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="zodiac-orbit-ring pointer-events-none absolute inset-[2%] size-[96%] opacity-90"
    >
      <circle
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke="var(--orbit-line, rgba(237,230,239,0.18))"
        strokeWidth="0.35"
      />
      <g
        className="motion-reduce:[animation:none]"
        style={{
          transformOrigin: '50px 50px',
          animation: `celestial-orbit calc(${PERIOD} * var(--orbit-tempo, 1)) linear infinite`,
        }}
      >
        {RASHIS.map((rashi, i) => {
          const deg = i * 30 - 90
          const rad = (deg * Math.PI) / 180
          const x = 50 + R * Math.cos(rad)
          const y = 50 + R * Math.sin(rad)
          return (
            <g
              key={rashi.name}
              className="motion-reduce:[animation:none]"
              style={{
                transformOrigin: `${x}px ${y}px`,
                animation: `celestial-orbit calc(${PERIOD} * var(--orbit-tempo, 1)) linear infinite reverse`,
              }}
            >
              <text
                className="zodiac-orbit-glyph"
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                fontSize="3.2"
              >
                {rashi.glyph}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
