import { useState, useEffect, useId } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

interface EmotionPoint {
  date: string
  score: number
  count: number
}

interface EmotionChartProps {
  data: EmotionPoint[]
}

function readColors() {
  const s = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback
  return {
    pink:        v('--color-lizo-pink',      '#F2A0B0'),
    pinkDeep:    v('--color-lizo-pink-deep', '#E896A8'),
    surface:     v('--color-bg-surface',     '#FFF8F0'),
    cream:       v('--color-lizo-cream',     '#F5E8D3'),
    textPrimary: v('--color-text-primary',   '#2D1A0E'),
    textMuted:   v('--color-text-muted',     '#B89E85'),
  }
}

export default function EmotionChart({ data }: EmotionChartProps) {
  const [colors, setColors] = useState(readColors)
  const uid = useId()
  const gradientId = `lizoGradient-${uid.replace(/:/g, '')}`

  useEffect(() => {
    setColors(readColors())
    const observer = new MutationObserver(() => setColors(readColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  const { pink, pinkDeep, surface, cream, textPrimary, textMuted } = colors

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <span className="text-4xl animate-breathe">🦎</span>
        <p className="font-body text-sm text-text-muted text-center leading-relaxed">
          情绪曲线还是一条直线。
        </p>
        <p className="font-body text-xs text-text-muted/70 italic text-center">
          也许今天什么都还没发生。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-bg-surface border border-lizo-cream rounded-lg p-5 animate-fade-up">
      <p className="text-xs font-display font-semibold text-text-muted uppercase tracking-widest mb-4">
        近 7 天情绪
      </p>
      <ResponsiveContainer width="100%" height={140} minHeight={100}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={pink} stopOpacity={0.35} />
              <stop offset="95%" stopColor={pink} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: textMuted, fontFamily: 'Inter, sans-serif' }}
            tickFormatter={d => d.slice(5)}
          />
          <YAxis domain={[0, 1]} hide />
          <Tooltip
            contentStyle={{
              background: surface,
              border: `1px solid ${cream}`,
              borderRadius: 14,
              fontSize: 12,
              color: textPrimary,
              fontFamily: 'Inter, sans-serif',
            }}
            formatter={(v) => [typeof v === 'number' ? v.toFixed(2) : v, '情绪指数']}
            labelFormatter={l => String(l)}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={pink}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ fill: pink, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: pinkDeep, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
