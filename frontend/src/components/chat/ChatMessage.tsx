interface ChatMessageProps {
  role: 'user' | 'lizo'
  text: string
  emotion?: string
}

const EMOTION_WHISPER: Record<string, string> = {
  开心: '（Lizo 心情很好）',
  感动: '（被你说的话触动了）',
  难过: '（心里有点重）',
  焦虑: '（尾巴不安地摆着）',
  疲惫: '（有点困，但还在）',
  生气: '（竖起了背鳍）',
  平静: '',
  '--':  '',
}

export default function ChatMessage({ role, text, emotion }: ChatMessageProps) {
  const isLizo = role === 'lizo'

  return (
    <div className={`flex items-end gap-2 animate-fade-up ${isLizo ? 'justify-start' : 'justify-end'}`}>
      {isLizo && (
        <div className="w-6 h-6 rounded-full bg-lizo-cream flex-shrink-0 flex items-center justify-center text-sm mb-1">
          🦎
        </div>
      )}

      <div
        className={`
          max-w-[75%] px-4 py-3 text-sm font-body leading-relaxed
          ${isLizo
            ? 'bg-bg-surface text-text-primary rounded-lg rounded-bl-sm border border-lizo-cream'
            : 'bg-lizo-pink text-white rounded-lg rounded-br-sm'
          }
        `}
      >
        {text}
        {isLizo && emotion && EMOTION_WHISPER[emotion] && (
          <span className="block text-[11px] text-text-muted italic mt-1 opacity-75">
            {EMOTION_WHISPER[emotion]}
          </span>
        )}
      </div>
    </div>
  )
}
