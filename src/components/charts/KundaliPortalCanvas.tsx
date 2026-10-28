import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Cosmic portal → celestial mechanism → ambient handoff.
 * Progress 0..1 drives the cinematic; ambient keeps a calm residual field.
 */
const fragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uProgress;
uniform float uAmbient;
uniform float uIntensity;
uniform vec3 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

float ring(vec2 p, float r, float w) {
  return smoothstep(w, 0.0, abs(length(p) - r));
}

// Perspective diamond wire that flattens with t (0=deep, 1=flat kundli square).
float diamondWire(vec2 uv, float t) {
  // Fake depth: squash Y and shear early, settle to square diamond.
  float depth = mix(0.55, 1.0, t);
  float shear = mix(0.35, 0.0, t);
  vec2 p = uv;
  p.y *= depth;
  p.x += p.y * shear;
  // Outer square rim in diamond space
  vec2 q = abs(p);
  float square = max(q.x, q.y);
  float rim = smoothstep(0.42, 0.405, square) * smoothstep(0.38, 0.395, square);
  // Inner diamond (rotated square)
  float d = (q.x + q.y) * 0.7071;
  float dia = smoothstep(0.42, 0.405, d) * smoothstep(0.38, 0.395, d);
  // Diagonals
  float diag1 = smoothstep(0.008, 0.0, abs(p.x - p.y));
  float diag2 = smoothstep(0.008, 0.0, abs(p.x + p.y));
  float cross = (diag1 + diag2) * smoothstep(0.42, 0.0, square);
  return rim * 0.9 + dia * 1.1 + cross * 0.55;
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(uResolution.z, 1.0);
  float t = clamp(uProgress, 0.0, 1.0);
  float time = uTime;

  // Camera dolly — pull toward center through portal
  float zoom = mix(1.55, 1.0, smoothstep(0.0, 0.45, t));
  vec2 p = uv * zoom;
  p *= mix(1.0, 0.92, smoothstep(0.35, 0.7, t));

  // Void base — keep enough contrast that motion reads on mid-range screens
  vec3 col = vec3(0.06, 0.03, 0.14);
  float neb = fbm(p * 1.8 + time * 0.03);
  col += vec3(0.42, 0.18, 0.85) * neb * mix(0.95, 0.35, t);
  col += vec3(0.12, 0.18, 0.42) * fbm(p * 3.2 - time * 0.02) * 0.55;

  // Depth star field (parallax layers)
  for (float layer = 1.0; layer <= 3.0; layer++) {
    float scale = 8.0 * layer;
    vec2 sp = p * scale + vec2(time * (0.02 / layer), time * (0.015 / layer));
    vec2 id = floor(sp);
    vec2 f = fract(sp) - 0.5;
    float h = hash(id + layer * 17.0);
    float tw = 0.6 + 0.4 * sin(time * (1.5 + h * 2.0) + h * 40.0);
    float star = smoothstep(0.12, 0.0, length(f - (h - 0.5) * 0.2)) * step(0.78, h) * tw;
    col += vec3(0.85, 0.78, 1.0) * star * (0.35 / layer) * mix(1.0, 0.45, t);
  }

  // Multi-speed orbital rings
  float ang = atan(p.y, p.x);
  for (float i = 0.0; i < 5.0; i++) {
    float rr = 0.18 + i * 0.09;
    float speed = mix(0.35, -0.55, i / 4.0);
    float a = ang + time * speed + i;
    float glow = ring(p, rr, 0.012 + i * 0.002);
    float beads = smoothstep(0.7, 1.0, sin(a * (6.0 + i) + time) * 0.5 + 0.5);
    vec3 ringCol = mix(vec3(0.45, 0.25, 0.95), vec3(0.78, 0.62, 1.0), i / 4.0);
    float portalGate = smoothstep(0.7, 0.2, t);
    col += ringCol * glow * (0.95 + beads * 1.2) * portalGate * uIntensity;
  }

  // Concentrated center light
  float core = exp(-length(p) * mix(4.5, 9.0, t)) * mix(1.8, 0.45, t);
  col += vec3(0.7, 0.45, 1.0) * core * uIntensity;

  // Expanding circular wave (portal rupture)
  float waveT = smoothstep(0.08, 0.42, t);
  float waveR = waveT * 1.4;
  float wave = smoothstep(0.04, 0.0, abs(length(p) - waveR)) * (1.0 - waveT);
  col += vec3(0.75, 0.55, 1.0) * wave * 1.4;

  // Celestial mechanism — geometric planes aligning into kundli
  float mech = smoothstep(0.28, 0.55, t) * (1.0 - smoothstep(0.72, 0.92, t));
  float flat = smoothstep(0.32, 0.62, t);
  float wire = diamondWire(p * mix(1.35, 1.05, flat), flat);
  col += vec3(0.85, 0.65, 1.0) * wire * mech * 2.0;

  // Secondary rotated plane (3D layering cue)
  float wire2 = diamondWire(p * vec2(1.15, mix(0.7, 1.0, flat)) * 0.95, flat * 0.9);
  col += vec3(0.55, 0.3, 1.0) * wire2 * mech * 1.1;

  // Energy field traveling through formed chart
  float energy = smoothstep(0.5, 0.68, t) * (1.0 - smoothstep(0.75, 0.9, t));
  float sweep = fract(ang / 6.28318 + t * 1.8);
  float beam = smoothstep(0.08, 0.0, abs(sweep - 0.5)) * smoothstep(0.45, 0.2, length(p));
  col += vec3(0.65, 0.45, 1.0) * beam * energy * 0.8;

  // Hand off — dim cinematic, leave ambient nebula
  float handoff = smoothstep(0.85, 1.0, t);
  col *= mix(1.0, 0.35, handoff);
  col += vec3(0.12, 0.07, 0.28) * fbm(p * 1.2 + time * 0.01) * uAmbient * 0.55;

  // Soft vignette
  float vig = smoothstep(1.35, 0.35, length(uv));
  col *= vig;

  // Sparse chromatic fringe near bright edges (restrained)
  float fringe = wire * mech * 0.08;
  col.r += fringe;
  col.b += fringe * 0.5;

  float alpha = mix(1.0, mix(0.65, 0.32, uAmbient), handoff);
  alpha = clamp(alpha * uIntensity, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

export type PortalMode = 'cinematic' | 'ambient' | 'off'

export interface KundaliPortalCanvasProps {
  /** 0–1 cinematic progress (driven by the stage choreographer). */
  progress: number
  mode?: PortalMode
  className?: string
  onReady?: () => void
  onUnavailable?: () => void
}

/**
 * WebGL cosmic portal (ogl). Decorative only — never touches chart data.
 */
export function KundaliPortalCanvas({
  progress,
  mode = 'cinematic',
  className,
  onReady,
  onUnavailable,
}: KundaliPortalCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(progress)
  const modeRef = useRef(mode)

  useEffect(() => {
    progressRef.current = progress
    modeRef.current = mode
  }, [progress, mode])

  useEffect(() => {
    const host = hostRef.current
    if (!host || mode === 'off') return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      onUnavailable?.()
      return
    }

    let disposed = false
    let animateId = 0

    try {
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.75),
      })
      const gl = renderer.gl

      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.display = 'block'
      gl.canvas.setAttribute('aria-hidden', 'true')
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)

      const geometry = new Triangle(gl)
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uAmbient: { value: 0 },
          uIntensity: { value: 1 },
          uResolution: { value: new Color(1, 1, 1) },
        },
        transparent: true,
      })

      const mesh = new Mesh(gl, { geometry, program })

      function resize() {
        const el = hostRef.current
        if (!el) return
        const w = el.offsetWidth
        const h = el.offsetHeight
        if (w < 2 || h < 2) return
        renderer.setSize(w, h)
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / Math.max(gl.canvas.height, 1),
        )
      }

      resize()
      window.addEventListener('resize', resize)
      host.appendChild(gl.canvas)
      onReady?.()

      const start = performance.now()
      function frame(now: number) {
        if (disposed) return
        animateId = requestAnimationFrame(frame)
        const elapsed = (now - start) * 0.001
        const m = modeRef.current
        program.uniforms.uTime.value = elapsed
        program.uniforms.uProgress.value =
          m === 'ambient' ? 1 : Math.min(1, Math.max(0, progressRef.current))
        program.uniforms.uAmbient.value = m === 'ambient' ? 1 : m === 'cinematic' ? 0.15 : 0
        program.uniforms.uIntensity.value = m === 'ambient' ? 0.55 : 1
        renderer.render({ scene: mesh })
      }
      animateId = requestAnimationFrame(frame)

      return () => {
        disposed = true
        cancelAnimationFrame(animateId)
        window.removeEventListener('resize', resize)
        if (gl.canvas.parentElement === host) host.removeChild(gl.canvas)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    } catch {
      onUnavailable?.()
      return undefined
    }
  }, [mode, onReady, onUnavailable])

  if (mode === 'off') return null

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    />
  )
}
