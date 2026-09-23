import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'
import liizoooResting from '../assets/liizooo/liizooo-resting-v1.png'

type Habitat = 'mobile' | 'desktop'
type Mood = 'calm' | 'stressed' | 'sleepy' | 'happy'
type Behavior = 'resting' | 'breathing' | 'stroking' | 'hugging' | 'arriving'

interface NestState {
  location: Habitat | 'physical'
  mood: Mood
  energy: number
  bond: number
  behavior: Behavior
  updated_at?: string | null
}

const DEFAULT_STATE: NestState = {
  location: 'desktop', mood: 'calm', energy: 72, bond: 64, behavior: 'resting',
}

const COPY: Record<Mood, string> = {
  calm: '它只是安静地趴在这里。',
  stressed: '它靠近边缘，陪你慢慢呼吸。',
  sleepy: '它把尾巴卷起来了。',
  happy: '尾巴轻轻晃了一下。',
}

function DeviceIcon({ habitat }: { habitat: Habitat }) {
  return <span aria-hidden="true">{habitat === 'mobile' ? '📱' : '💻'}</span>
}

export default function Habitat() {
  const [habitat, setHabitat] = useState<Habitat>('mobile')
  const [nest, setNest] = useState<NestState>(DEFAULT_STATE)
  const [leaving, setLeaving] = useState(false)
  const [notice, setNotice] = useState('LIIZOOO NEST 已连接')
  const holdTimer = useRef<number | null>(null)
  const stroked = useRef(false)

  useEffect(() => {
    let mounted = true
    const readNest = async () => {
      try {
        const res = await apiFetch('/api/v1/nest')
        const json = await res.json()
        if (mounted && json.status === 'success') {
          setNest(json.data as NestState)
          setNotice('LIIZOOO NEST 已连接')
        }
      } catch {
        if (mounted) setNotice('演示模式：本地状态运行中')
      }
    }
    void readNest()
    const poll = window.setInterval(() => void readNest(), 1200)
    return () => {
      mounted = false
      window.clearInterval(poll)
    }
  }, [])

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
  }, [])

  async function updateNest(changes: Partial<NestState>) {
    const optimistic = { ...nest, ...changes }
    setNest(optimistic)
    try {
      const res = await apiFetch('/api/v1/nest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      const json = await res.json()
      if (json.status === 'success') setNest(json.data as NestState)
    } catch {
      setNotice('演示模式：动作保留在当前设备')
    }
  }

  function settle() {
    window.setTimeout(() => void updateNest({ behavior: 'breathing' }), 850)
  }

  function startTouch() {
    stroked.current = false
    holdTimer.current = window.setTimeout(() => {
      void updateNest({ behavior: 'hugging', bond: Math.min(100, nest.bond + 2) })
      navigator.vibrate?.([80, 55, 110])
      setNotice('咚……咚…… Liizooo 的心跳')
    }, 550)
  }

  function stroke() {
    if (stroked.current) return
    stroked.current = true
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    void updateNest({ behavior: 'stroking', mood: 'happy', bond: Math.min(100, nest.bond + 1) })
    setNotice('它眯起眼睛，尾巴摆了一下')
  }

  function endTouch() {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    holdTimer.current = null
    settle()
  }

  function setMood(mood: Mood) {
    void updateNest({ mood, behavior: mood === 'stressed' ? 'breathing' : 'resting' })
    setNotice(COPY[mood])
  }

  function jump(target: Habitat) {
    if (target === habitat || leaving) return
    setLeaving(true)
    setNotice(`Liizooo 正在前往${target === 'mobile' ? '手机' : '电脑'}……`)
    window.setTimeout(() => {
      void updateNest({ location: target, behavior: 'arriving' })
      setLeaving(false)
    }, 700)
  }

  const present = nest.location === habitat
  const visualBehavior = nest.behavior === 'hugging' ? 'scale-105' : nest.behavior === 'stroking' ? 'rotate-[-2deg]' : ''

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#101421] px-4 py-6 text-[#f7f0e8] sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#e8b4a7]">LIIZOOO ECOSYSTEM · PROTOTYPE</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">同一只 Liizooo，住在不同栖息地。</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#b8b9c6]">触摸它、让它慢呼吸，或把它送往另一块屏幕。状态由 LIIZOOO NEST 持续保存。</p>
          </div>
          <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#d4d0d9]">● {notice}</p>
        </div>

        <div className="mb-6 flex gap-2" role="tablist" aria-label="切换 Liizooo 栖息地">
          {(['mobile', 'desktop'] as Habitat[]).map(option => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={habitat === option}
              onClick={() => setHabitat(option)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${habitat === option ? 'bg-[#e8b4a7] font-semibold text-[#2e2025]' : 'border border-white/10 bg-white/5 text-[#d4d0d9] hover:bg-white/10'}`}
            >
              <DeviceIcon habitat={option} /> {option === 'mobile' ? 'Mobile Habitat' : 'Desktop Habitat'}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <HabitatScene
            habitat={habitat}
            present={present && !leaving}
            behavior={nest.behavior}
            visualBehavior={visualBehavior}
            onTouchStart={startTouch}
            onStroke={stroke}
            onTouchEnd={endTouch}
          />

          <aside className="rounded-[24px] border border-white/10 bg-[#191e2e] p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#e8b4a7]">LIIZOOO NEST</p>
            <div className="mt-5 space-y-4 text-sm">
              <StateRow label="Location" value={nest.location === 'mobile' ? 'Mobile' : nest.location === 'desktop' ? 'Desktop' : 'Physical'} />
              <StateRow label="Mood" value={nest.mood} />
              <StateRow label="Energy" value={`${nest.energy}%`} />
              <StateRow label="Bond" value={`${nest.bond}%`} />
            </div>
            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="mb-3 text-xs text-[#9fa2b5]">情绪 → 行为</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMood('calm')} className="habitat-action">平静</button>
                <button onClick={() => setMood('stressed')} className="habitat-action">压力</button>
                <button onClick={() => setMood('sleepy')} className="habitat-action">困倦</button>
                <button onClick={() => setMood('happy')} className="habitat-action">开心</button>
              </div>
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="mb-3 text-xs text-[#9fa2b5]">Device Jump</p>
              <button onClick={() => jump(habitat === 'mobile' ? 'desktop' : 'mobile')} className="w-full rounded-xl bg-[#e8b4a7] px-3 py-2.5 text-sm font-semibold text-[#2e2025] transition-transform hover:scale-[1.02]">
                前往{habitat === 'mobile' ? '电脑' : '手机'} →
              </button>
            </div>
          </aside>
        </div>

        <p className="mt-4 text-center text-xs text-[#73778a]">摸背：滑动角色 · 抱住：长按角色 · 手机可触发触觉反馈</p>
      </section>
    </main>
  )
}

function StateRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-[#9fa2b5]">{label}</span><span className="font-medium capitalize">{value}</span></div>
}

interface SceneProps {
  habitat: Habitat
  present: boolean
  behavior: Behavior
  visualBehavior: string
  onTouchStart: () => void
  onStroke: () => void
  onTouchEnd: () => void
}

function HabitatScene({ habitat, present, behavior, visualBehavior, onTouchStart, onStroke, onTouchEnd }: SceneProps) {
  const lizard = present ? (
    <button
      type="button"
      aria-label="触摸 Liizooo"
      onPointerDown={onTouchStart}
      onPointerMove={onStroke}
      onPointerUp={onTouchEnd}
      onPointerCancel={onTouchEnd}
      className={`liizooo-pet absolute inset-0 touch-none select-none transition-transform duration-700 ${visualBehavior} ${behavior === 'arriving' ? 'animate-liizooo-arrive' : 'animate-liizooo-breathe'}`}
    >
      <img src={liizoooResting} alt="趴着的 Liizooo 毛绒蜥蜴" draggable="false" />
    </button>
  ) : (
    <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm text-white/55">Liizooo 正栖息在另一台设备上。<br />从那里让它跳过来吧。</p>
  )

  if (habitat === 'mobile') {
    return (
      <div className="flex min-h-[560px] items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0f1a] p-5">
        <div className="relative h-[620px] w-[min(100%,350px)] overflow-hidden rounded-[34px] border-[6px] border-[#252b39] bg-[radial-gradient(circle_at_50%_10%,#4c5269_0%,#22283a_36%,#111622_100%)] shadow-2xl">
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-5 text-[11px] text-white/65"><span>9:41</span><span>●●●</span></div>
          <div className="px-6 pt-20"><p className="text-lg font-semibold">Liizooo</p><p className="mt-1 text-xs text-white/55">它住在你的屏幕边缘。</p></div>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-[linear-gradient(180deg,transparent,rgba(6,8,14,.65))]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 border-t border-white/10 bg-[#171d2d]/80 backdrop-blur" />
          <div className="absolute bottom-6 left-6 right-6 z-10 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs text-white/75">{behavior === 'hugging' ? '咚……咚……' : '从头到尾，慢慢摸摸它。'}</div>
          <div className="absolute bottom-20 right-[-56px] h-[245px] w-[370px]">{lizard}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,#252d42,#101521_66%)]">
      <div className="flex h-12 items-center gap-2 border-b border-white/10 bg-[#151b2b] px-5 text-xs text-white/60"><span className="h-2.5 w-2.5 rounded-full bg-[#ef8c84]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e9c76c]" /><span className="h-2.5 w-2.5 rounded-full bg-[#7acb9f]" /><span className="ml-4 rounded-md bg-white/5 px-3 py-1">Draft paper — Liizooo</span></div>
      <div className="mx-auto mt-14 w-4/5 rounded-xl bg-white/[.04] p-7 text-sm leading-8 text-white/25"><span className="text-white/50">Liizooo: Exploring Continuous Presence…</span><br /><br />A companion does not always need to speak. Sometimes, it simply remains nearby.<br /><br />The device surface becomes a habitat.</div>
      <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-white/10 bg-[#121827]" />
      <div className="absolute bottom-1 right-[-32px] h-[245px] w-[390px]">{lizard}</div>
    </div>
  )
}
