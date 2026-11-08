import { useRef, useState, type CSSProperties } from 'react'

const sparkColors = ['#fffbeb', '#fde68a', '#fbbf24', '#f59e0b']

type Spark = { angle: number; distance: number; color: string; size: number }
type Burst = { id: number; x: number; y: number; sparks: Spark[] }

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

function playDiwaliSound() {
  const AudioCtor =
    window.AudioContext ?? (window as AudioWindow).webkitAudioContext
  if (!AudioCtor) return

  const ctx = new AudioCtor()
  if (ctx.state === 'suspended') void ctx.resume()

  const master = ctx.createGain()
  master.gain.setValueAtTime(0.16, ctx.currentTime)
  master.connect(ctx.destination)

  const echo = ctx.createDelay(1)
  echo.delayTime.value = 0.26
  const feedback = ctx.createGain()
  feedback.gain.value = 0.22
  const wet = ctx.createGain()
  wet.gain.value = 0.3
  master.connect(echo)
  echo.connect(feedback)
  feedback.connect(echo)
  echo.connect(wet)
  wet.connect(ctx.destination)

  const now = ctx.currentTime

  const bell = (freq: number, start: number, dur: number, level: number) => {
    const partials = [1, 2.01, 2.99, 4.16, 5.43]
    const partialLevels = [1, 0.45, 0.3, 0.16, 0.09]
    partials.forEach((mult, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * mult
      g.gain.setValueAtTime(0, start)
      g.gain.linearRampToValueAtTime(level * partialLevels[i], start + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(g).connect(master)
      osc.start(start)
      osc.stop(start + dur + 0.05)
    })
  }

  const pluck = (freq: number, start: number, dur: number, level: number) => {
    const osc = ctx.createOscillator()
    const octave = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const g = ctx.createGain()
    osc.type = 'triangle'
    octave.type = 'sine'
    osc.frequency.value = freq
    octave.frequency.value = freq * 2
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2800, start)
    filter.frequency.exponentialRampToValueAtTime(900, start + dur)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(level, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(filter)
    octave.connect(filter)
    filter.connect(g).connect(master)
    osc.start(start)
    octave.start(start)
    osc.stop(start + dur + 0.05)
    octave.stop(start + dur + 0.05)
  }

  const crackle = (start: number, level: number, freq: number) => {
    const len = 0.18
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * len),
      ctx.sampleRate,
    )
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = freq
    bp.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(level, start + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, start + len)
    src.connect(bp)
    bp.connect(g)
    g.connect(master)
    src.start(start)
    src.stop(start + len)
  }

  bell(523.25, now, 4.2, 0.5)

  const melody = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
  melody.forEach((freq, i) => {
    pluck(freq, now + 0.06 + i * 0.22, 1.4, 0.24)
  })

  const melodyHigh = [587.33, 659.25, 783.99, 880, 1046.5, 1174.66]
  melodyHigh.forEach((freq, i) => {
    pluck(freq, now + 2.2 + i * 0.24, 1.6, 0.18)
  })

  const shimmer = [1568, 1760, 2093, 2349, 2637, 3136]
  shimmer.forEach((freq, i) => {
    bell(freq, now + 1.8 + i * 0.5, 2, 0.08)
  })

  for (let i = 0; i < 22; i++) {
    const start = now + 3.4 + Math.random() * 3.8
    crackle(start, 0.04 + Math.random() * 0.04, 900 + Math.random() * 2600)
  }

  bell(1046.5, now + 5.6, 2.4, 0.2)

  window.setTimeout(() => void ctx.close(), 9000)
}

const stars = Array.from({ length: 70 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2.2 + 0.6,
  delay: Math.random() * 6,
  duration: Math.random() * 4 + 2.5,
}))

const embers = Array.from({ length: 26 }, (_, i) => ({
  left: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  delay: Math.random() * 9,
  duration: Math.random() * 9 + 7,
  drift: (Math.random() - 0.5) * 140,
  color: ['#fcd34d', '#fdba74', '#fca5a5'][i % 3],
}))

const fireworks = [
  { left: 16, top: 26, color: '#fbbf24', delay: 0 },
  { left: 82, top: 20, color: '#f472b6', delay: 0.5 },
  { left: 64, top: 46, color: '#a78bfa', delay: 1.1 },
  { left: 30, top: 58, color: '#fde68a', delay: 1.7 },
  { left: 50, top: 14, color: '#fb923c', delay: 2.2 },
]

const blessings = [
  { icon: '🪔', title: 'Endless Light', text: 'Every dark corner blessed with hope.' },
  { icon: '🪙', title: 'Prosperity', text: 'Abundance that always finds its way home.' },
  { icon: '🍬', title: 'Sweet Moments', text: 'Joy in every little celebration.' },
]

function Rangoli({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor">
      <g strokeWidth="0.7">
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="80" strokeDasharray="2 5" />
        <circle cx="100" cy="100" r="38" />
        <circle cx="100" cy="100" r="20" />
        {Array.from({ length: 24 }).map((_, i) => (
          <ellipse
            key={`p${i}`}
            cx="100"
            cy="52"
            rx="7"
            ry="22"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`l${i}`}
            x1="100"
            y1="60"
            x2="100"
            y2="140"
            opacity="0.5"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
        {Array.from({ length: 36 }).map((_, i) => (
          <circle
            key={`d${i}`}
            cx="100"
            cy="12"
            r="1.6"
            fill="currentColor"
            stroke="none"
            transform={`rotate(${i * 10} 100 100)`}
          />
        ))}
      </g>
    </svg>
  )
}

function GaneshaIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Bhagwan Ganesh"
    >
      <defs>
        <radialGradient id="ganeshBg" cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor="#3a1d0a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#140a1f" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id="ganeshGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#ganeshBg)" />
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="url(#ganeshGold)"
        strokeWidth="1"
        opacity="0.85"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke="url(#ganeshGold)"
        strokeWidth="0.8"
        strokeDasharray="1 4"
        opacity="0.7"
      />
      <g
        fill="none"
        stroke="url(#ganeshGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M50 11 L57 22 L54.5 24 L45.5 24 L43 22 Z" />
        <path d="M44 22 L56 22" opacity="0.8" />
        <circle cx="50" cy="9" r="1.4" fill="url(#ganeshGold)" stroke="none" />
        <circle cx="47" cy="18.5" r="0.9" fill="url(#ganeshGold)" stroke="none" />
        <circle cx="53" cy="18.5" r="0.9" fill="url(#ganeshGold)" stroke="none" />

        <path d="M39 29 C26 27 21 40 26 49 C29 54 35 54 39 49 C37 42 37 35 39 29 Z" />
        <path d="M61 29 C74 27 79 40 74 49 C71 54 65 54 61 49 C63 42 63 35 61 29 Z" />
        <path d="M39 30 C35 40 40 52 50 53 C60 52 65 40 61 30 C57 24 43 24 39 30 Z" />

        <path d="M41.5 36 Q44 33.8 46.5 36" />
        <path d="M53.5 36 Q56 33.8 58.5 36" />
        <circle cx="44" cy="37" r="0.7" fill="url(#ganeshGold)" stroke="none" />
        <circle cx="56" cy="37" r="0.7" fill="url(#ganeshGold)" stroke="none" />
        <path d="M50 29.5 L50 33" />

        <path
          d="M50 40 C51 48 47 55 41 58 C36 60 33 56 35.5 52.5"
          strokeWidth="3.4"
        />
        <circle cx="35.8" cy="52.8" r="1.4" fill="url(#ganeshGold)" stroke="none" />

        <path d="M46 47 C44 51 41 53 38 53" strokeWidth="1.3" />
        <path d="M54 47 C56 51 59 53 62 53" strokeWidth="1.3" />
        <path d="M46 49 Q50 51 54 49" opacity="0.8" />

        <circle cx="31.5" cy="47" r="1.2" fill="url(#ganeshGold)" stroke="none" />
        <circle cx="68.5" cy="47" r="1.2" fill="url(#ganeshGold)" stroke="none" />

        <path d="M50 76 C47 71 47 66 50 62 C53 66 53 71 50 76" />
        <path d="M50 73 C44 70 41 66 42 61 C46 62 49 67 50 73" />
        <path d="M50 73 C56 70 59 66 58 61 C54 62 51 67 50 73" />
        <path d="M35 72 Q50 79 65 72" opacity="0.8" />
      </g>
    </svg>
  )
}

function LakshmiIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Devi Lakshmi"
    >
      <defs>
        <radialGradient id="lakshmiBg" cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor="#3a1d0a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#140a1f" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id="lakshmiGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#lakshmiBg)" />
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="url(#lakshmiGold)"
        strokeWidth="1"
        opacity="0.85"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke="url(#lakshmiGold)"
        strokeWidth="0.8"
        strokeDasharray="1 4"
        opacity="0.7"
      />
      <g
        fill="none"
        stroke="url(#lakshmiGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="50" cy="28" r="12" strokeDasharray="1.5 3" opacity="0.75" />

        <path d="M44 22 L46 15 L50 18 L54 15 L56 22 Z" />
        <path d="M45 22.5 L55 22.5" opacity="0.8" />
        <circle cx="50" cy="13" r="1" fill="url(#lakshmiGold)" stroke="none" />

        <path d="M44.5 27 C42.5 33 43 38 45 41" opacity="0.8" />
        <path d="M55.5 27 C57.5 33 57 38 55 41" opacity="0.8" />

        <ellipse cx="50" cy="30" rx="5.5" ry="6.5" />
        <circle cx="48" cy="30" r="0.7" fill="url(#lakshmiGold)" stroke="none" />
        <circle cx="52" cy="30" r="0.7" fill="url(#lakshmiGold)" stroke="none" />
        <circle cx="50" cy="25.5" r="0.8" fill="url(#lakshmiGold)" stroke="none" />
        <path d="M48.5 34 Q50 35 51.5 34" opacity="0.8" />

        <path d="M46 39 Q50 42 54 39" opacity="0.9" />

        <path d="M44 42 C36 48 32 58 32 68 L68 68 C68 58 64 48 56 42" />
        <path d="M44 42 Q50 39.5 56 42" opacity="0.8" />
        <path d="M45 50 C43 57 42 62 42 68" opacity="0.6" />
        <path d="M55 50 C57 57 58 62 58 68" opacity="0.6" />
        <path d="M39 60 Q50 64 61 60" opacity="0.7" />

        <path d="M44 44 C38 41 34 35 36 28" />
        <path d="M56 44 C62 41 66 35 64 28" />
        <path d="M44 46 C40 52 38 57 40 62" />
        <path d="M56 46 C60 52 62 57 60 62" />
        <circle cx="36" cy="27.5" r="1.2" fill="url(#lakshmiGold)" stroke="none" />
        <circle cx="64" cy="27.5" r="1.2" fill="url(#lakshmiGold)" stroke="none" />
        <circle cx="40" cy="62.5" r="1.2" fill="url(#lakshmiGold)" stroke="none" />
        <circle cx="60" cy="62.5" r="1.2" fill="url(#lakshmiGold)" stroke="none" />

        <path d="M36 26 C34 23 34.5 21 36 19 C37.5 21 38 23 36 26 Z" opacity="0.9" />
        <path d="M35 25 C32.5 24 31.5 22 32 20 C34 21 35 23 35 25 Z" opacity="0.7" />
        <path d="M37 25 C39.5 24 40.5 22 40 20 C38 21 37 23 37 25 Z" opacity="0.7" />
        <path d="M64 26 C62 23 62.5 21 64 19 C65.5 21 66 23 64 26 Z" opacity="0.9" />
        <path d="M63 25 C60.5 24 59.5 22 60 20 C62 21 63 23 63 25 Z" opacity="0.7" />
        <path d="M65 25 C67.5 24 68.5 22 68 20 C66 21 65 23 65 25 Z" opacity="0.7" />

        <path d="M50 76 C47 71 47 66 50 62 C53 66 53 71 50 76" />
        <path d="M50 73 C44 70 41 66 42 61 C46 62 49 67 50 73" />
        <path d="M50 73 C56 70 59 66 58 61 C54 62 51 67 50 73" />
        <path d="M35 72 Q50 79 65 72" opacity="0.8" />
      </g>
    </svg>
  )
}

function Diya({
  className = '',
  flame = true,
  style,
}: {
  className?: string
  flame?: boolean
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} overflow="visible">
      <defs>
        <linearGradient id="diyaBowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="55%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id="diyaFlame" cx="50%" cy="70%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="45%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <radialGradient id="diyaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="52" rx="24" ry="4.5" fill="#000" opacity="0.4" />
      <circle cx="32" cy="28" r="20" fill="url(#diyaGlow)" className="anim-glow" />
      {flame && (
        <path
          d="M32 11c5 8 8 13 8 18a8 8 0 1 1-16 0c0-5 3-10 8-18z"
          fill="url(#diyaFlame)"
          className="anim-flicker"
          style={{ filter: 'drop-shadow(0 0 9px rgba(251,191,36,0.95))' }}
        />
      )}
      <path
        d="M9 38c0 9 10 15 23 15s23-6 23-15c0-2.6-9-4.2-23-4.2S9 35.4 9 38z"
        fill="url(#diyaBowl)"
      />
      <path
        d="M10 38c9 3 35 3 44 0-2 4-10 7-22 7s-20-3-22-7z"
        fill="#fde68a"
        opacity="0.25"
      />
    </svg>
  )
}

function Firework({
  left,
  top,
  color,
  delay,
}: {
  left: number
  top: number
  color: string
  delay: number
}) {
  return (
    <div className="absolute h-0 w-0" style={{ left: `${left}%`, top: `${top}%` }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360
        const style = {
          marginLeft: -3,
          marginTop: -3,
          background: color,
          boxShadow: `0 0 10px 2px ${color}`,
          animation: `firework 1.8s cubic-bezier(.2,.7,.3,1) ${delay + i * 0.02}s infinite`,
          ['--angle' as string]: `${angle}deg`,
        } as CSSProperties

        return (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={style}
          />
        )
      })}
    </div>
  )
}

function Sparkles({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {b.sparks.map((s, i) => {
            const style = {
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              background: s.color,
              boxShadow: `0 0 8px ${s.color}`,
              animation: 'sparkBurst .9s cubic-bezier(.2,.7,.3,1) forwards',
              ['--a' as string]: `${s.angle}deg`,
              ['--d' as string]: `${s.distance}px`,
            } as CSSProperties

            return (
              <span key={i} className="absolute block rounded-full" style={style} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Background({ celebrate }: { celebrate: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -top-48 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
      <div className="absolute bottom-[-10rem] left-[10%] h-[30rem] w-[30rem] rounded-full bg-amber-500/20 blur-[130px]" />
      <div className="absolute bottom-[-6rem] right-[8%] h-[26rem] w-[26rem] rounded-full bg-rose-500/10 blur-[120px]" />

      {celebrate && (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(253,224,71,0.24),transparent_58%)]"
          style={{ animation: 'glowIn 1.5s ease-out both' }}
        />
      )}

      <div className="absolute left-1/2 top-1/2 h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 text-amber-300/10">
        <Rangoli className="h-full w-full anim-spin-slow" />
      </div>
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-amber-200/[0.07]">
        <Rangoli className="h-full w-full anim-spin-reverse" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(3,0,10,0.9)_100%)]" />

      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              background: e.color,
              boxShadow: `0 0 8px ${e.color}`,
              animation: `rise ${e.duration}s linear ${e.delay}s infinite`,
              ['--drift' as string]: `${e.drift}px`,
            } as CSSProperties
          }
        />
      ))}

      {celebrate && (
        <div className="absolute inset-0">
          {fireworks.map((f, i) => (
            <Firework key={i} {...f} />
          ))}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 px-4 opacity-95 sm:gap-8 md:gap-14">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="anim-float" style={{ animationDelay: `${i * 0.6}s` }}>
            <Diya className="h-9 w-9 sm:h-14 sm:w-14 md:h-20 md:w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [celebrate, setCelebrate] = useState(false)
  const [bursts, setBursts] = useState<Burst[]>([])
  const burstId = useRef(0)

  const spawnBurst = (x: number, y: number) => {
    if (x === 0 && y === 0) return

    const id = ++burstId.current
    const sparks = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * 360 + (Math.random() * 18 - 9),
      distance: 40 + Math.random() * 70,
      color: sparkColors[i % sparkColors.length],
      size: 3 + Math.random() * 4,
    }))

    setBursts((prev) => [...prev, { id, x, y, sparks }])
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id))
    }, 1000)
  }

  return (
    <div
      className="relative min-h-svh w-full overflow-hidden bg-night-900 text-amber-50"
      onClick={(e) => spawnBurst(e.clientX, e.clientY)}
    >
      <Background celebrate={celebrate} />
      <Sparkles bursts={bursts} />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2 font-display text-base tracking-wide sm:text-lg">
          <span className="text-lg sm:text-xl">🪔</span>
          <span>
            Diwali <span className="text-amber-400">2026</span>
          </span>
        </div>
        <a
          href="#wishes"
          className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-amber-200 transition hover:bg-amber-400/20 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
        >
          A Wish
        </a>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-14 pt-6 text-center sm:px-6 sm:pb-16 sm:pt-12 lg:pt-16">
          {celebrate && (
            <div className="anim-reveal relative mb-5 sm:mb-7">
              <div className="anim-glow absolute -inset-8 -z-10 rounded-full bg-amber-400/40 blur-3xl" />
              <div className="absolute inset-0 -z-10 rounded-full bg-yellow-200/30 blur-2xl" />
              <div className="anim-float">
                <Diya className="h-20 w-20 sm:h-28 sm:w-28" />
              </div>
            </div>
          )}

          <h1 className="w-full leading-[0.92]">
            <span className="block font-display text-[clamp(2.5rem,11vw,4.5rem)] font-semibold text-amber-100">
              Happy
            </span>
            <span className="text-shimmer mt-1 block font-script text-[clamp(3.25rem,16vw,6rem)]">
              Diwali
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty px-1 text-sm leading-relaxed text-amber-100/70 sm:mt-7 sm:text-base md:text-lg">
            May the glow of a thousand diyas light up your home, your heart, and
            every beautiful beginning this year.
          </p>

          <button
            type="button"
            onClick={() => {
              playDiwaliSound()
              setCelebrate(true)
            }}
            className="group relative mt-8 w-full max-w-xs touch-manipulation overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 px-6 py-3.5 text-sm font-semibold tracking-wide whitespace-nowrap text-[#2a1200] shadow-[0_0_50px_-10px_rgba(251,191,36,0.9)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:mt-9 sm:w-auto sm:px-8 sm:text-base"
          >
            <span className="relative z-10">
              {celebrate ? '✨ शुभ दीपावली ✨' : '🪔 Light the Diyas'}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </section>

        <section id="wishes" className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="glass relative overflow-hidden rounded-3xl px-5 py-8 text-center sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-5 flex items-start justify-center gap-7 sm:mb-6 sm:gap-12">
              <GaneshaIcon className="h-20 w-20 drop-shadow-[0_0_16px_rgba(251,191,36,0.28)] sm:h-24 sm:w-24" />
              <LakshmiIcon className="h-20 w-20 drop-shadow-[0_0_16px_rgba(251,191,36,0.28)] sm:h-24 sm:w-24" />
            </div>

            <div className="mx-auto mb-5 h-px w-24 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent sm:mb-6 sm:w-28" />
            <p className="font-script text-2xl text-amber-200 sm:text-3xl md:text-4xl">
              A little wish for you
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-amber-50/75 sm:mt-5 sm:text-base md:text-lg">
              May your days be as bright as a sky full of fireworks, your nights as
              warm as a row of glowing diyas, and your year as sweet as the mithai
              shared with the people you love.
            </p>

            <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-3 sm:gap-4">
              {blessings.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-amber-200/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/10 sm:p-5"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <h3 className="mt-2 font-display text-base font-semibold text-amber-100 sm:mt-3 sm:text-lg">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-100/60 sm:text-sm">
                    {b.text}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-8 font-display text-base italic text-amber-100/60 sm:mt-10 sm:text-lg md:text-xl">
              With love, light &amp; a little magic ✨
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-amber-200/10 px-4 pb-24 pt-6 text-center text-[0.7rem] tracking-wide text-amber-100/40 sm:px-6 sm:pb-28 sm:pt-8 sm:text-xs">
        Made by Esha Gupta
      </footer>
    </div>
  )
}

export default App
