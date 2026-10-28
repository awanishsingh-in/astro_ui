import { useEffect, useId, useRef } from 'react'
import { cn } from '@/utils/cn'

type Star = {
  x: number
  y: number
  r: number
  color: string
  opacity: number
  twinkle: number
  phase: number
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

function readTheme(): 'dark' | 'light' {
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'light' ? 'light' : 'dark'
}

function buildStars(count: number, denseCloud: boolean, seed: number, theme: 'dark' | 'light'): Star[] {
  const rand = seeded(seed)
  const colors =
    theme === 'light'
      ? ['#6E4A60', '#9E6650', '#857784']
      : denseCloud
        ? ['#FFB0D9', '#E85AAD', '#FFFFFF', '#F3D9C4']
        : ['#FFFFFF', '#E4C4E8', '#FFB0D9']
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    let x = rand()
    let y = rand()
    if (denseCloud && theme === 'dark') {
      // Bias into upper-right magenta cloud
      x = 0.55 + rand() * 0.42 + (rand() - 0.5) * 0.12
      y = 0.05 + rand() * 0.45 + (rand() - 0.5) * 0.1
      x = Math.min(1, Math.max(0, x))
      y = Math.min(1, Math.max(0, y))
    }
    const baseOp =
      theme === 'light'
        ? 0.06 + rand() * 0.12
        : denseCloud
          ? 0.22 + rand() * 0.78
          : 0.12 + rand() * 0.38
    stars.push({
      x,
      y,
      r: theme === 'light' ? 0.3 + rand() * 0.55 : denseCloud ? 0.5 + rand() * 1.3 : 0.4 + rand() * 0.9,
      color: colors[Math.floor(rand() * colors.length)]!,
      opacity: baseOp,
      twinkle: 3 + rand() * 3,
      phase: rand() * Math.PI * 2,
    })
  }
  return stars
}

/**
 * Magenta nebula + dual star fields (sparkle + faint white).
 * Light mode: softer stars, no vignette — washes come from --app-bg-image.
 */
export function NebulaBackground({
  className,
  vignette = true,
}: {
  className?: string
  vignette?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useRef(false)
  const layerId = useId()
  const themeRef = useRef<'dark' | 'light'>('dark')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotion.current = mq.matches
    const onChange = () => {
      reduceMotion.current = mq.matches
    }
    mq.addEventListener('change', onChange)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    themeRef.current = readTheme()
    let sparkle = buildStars(themeRef.current === 'light' ? 90 : 420, true, 0xa57a0 ^ 0x51, themeRef.current)
    let faint = buildStars(themeRef.current === 'light' ? 60 : 180, false, 0xc0ffee, themeRef.current)

    let raf = 0
    let start = performance.now()

    const rebuild = () => {
      themeRef.current = readTheme()
      sparkle = buildStars(themeRef.current === 'light' ? 90 : 420, true, 0xa57a0 ^ 0x51, themeRef.current)
      faint = buildStars(themeRef.current === 'light' ? 60 : 180, false, 0xc0ffee, themeRef.current)
    }

    const resize = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      ctx.clearRect(0, 0, w, h)
      const t = (now - start) / 1000
      const starMul =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--star-opacity')) ||
        (themeRef.current === 'light' ? 0.18 : 0.55)

      const paint = (stars: Star[], animate: boolean) => {
        for (const s of stars) {
          let op = s.opacity * (themeRef.current === 'light' ? starMul / 0.18 : 1)
          if (animate && !reduceMotion.current) {
            op = op * (0.55 + 0.45 * Math.sin(t * ((Math.PI * 2) / s.twinkle) + s.phase))
          }
          ctx.beginPath()
          ctx.fillStyle = s.color
          ctx.globalAlpha = Math.max(0.02, Math.min(1, op))
          ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      paint(faint, false)
      paint(sparkle, themeRef.current === 'dark')

      if (!reduceMotion.current) {
        raf = requestAnimationFrame(draw)
      }
    }

    const onTheme = () => {
      rebuild()
      cancelAnimationFrame(raf)
      draw(performance.now())
    }

    const mo = new MutationObserver(onTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    resize()
    draw(performance.now())
    window.addEventListener('resize', resize)

    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('resize', resize)
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      data-nebula={layerId}
    >
      <div className="astro-app-bg absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {vignette && <div className="astro-vignette absolute inset-0" />}
    </div>
  )
}
