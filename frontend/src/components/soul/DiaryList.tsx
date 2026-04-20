interface DiaryEntry {
  date: string
  text: string
  emotion: string
  count: number
}

interface DiaryListProps {
  entries: DiaryEntry[]
}

const EMOTION_EMOJI: Record<string, string> = {
  开心: '😊', 感动: '🥹', 难过: '😢', 焦虑: '😰',
  疲惫: '😴', 生气: '😤', 平静: '😌', '--': '🦎',
}

export default function DiaryList({ entries }: DiaryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-5xl animate-breathe">🦎</span>
        <div className="text-center">
          <p className="font-body text-sm text-text-muted mb-1">日记本是空的。</p>
          <p className="font-body text-sm text-text-secondary">
            去和 Lizo 说说话，它会记下来的。
          </p>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry, index) => (
        <li
          key={entry.date}
          className="bg-bg-surface border border-lizo-cream rounded-lg p-5 animate-fade-up"
          style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-display font-semibold text-text-muted tracking-widest uppercase">
              {entry.date}
            </span>
            <span className="text-lg" title={entry.emotion}>
              {EMOTION_EMOJI[entry.emotion] ?? '🦎'}
            </span>
          </div>
          <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-4">{entry.text}</p>
          <p className="mt-3 text-xs text-text-muted font-body">今天聊了 {entry.count} 次</p>
        </li>
      ))}
    </ul>
  )
}
