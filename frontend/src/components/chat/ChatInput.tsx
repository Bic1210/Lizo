import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface BrowserSpeechRecognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition

type SpeechWindow = Window & typeof globalThis & {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const speechWindow = typeof window === 'undefined' ? null : window as SpeechWindow
  const SpeechRecognitionAPI = speechWindow?.SpeechRecognition ?? speechWindow?.webkitSpeechRecognition
  const speechSupported = Boolean(SpeechRecognitionAPI)

  function handleSend() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  function stopListening() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }

  function handleVoiceInput() {
    if (!speechSupported || disabled) return
    if (listening) {
      stopListening()
      return
    }

    const recognition = new SpeechRecognitionAPI!()
    recognition.lang = 'zh-CN'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript ?? '')
        .join('')
        .trim()

      setValue(transcript)

      const lastResult = event.results[event.results.length - 1]
      if (lastResult?.isFinal && transcript) {
        if (disabled) return
        onSend(transcript)
        setValue('')
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (!disabled) return
    stopListening()
  }, [disabled])

  useEffect(() => () => stopListening(), [])

  return (
    <div className="px-4 pt-3 bg-gradient-to-t from-bg-base via-bg-base to-transparent"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-3 bg-bg-elevated border border-lizo-cream rounded-full px-5 py-3 shadow-sm focus-within:border-lizo-pink transition-colors duration-300">
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={!speechSupported || disabled}
          className="w-10 h-10 rounded-full border border-lizo-cream flex items-center justify-center text-sm text-text-secondary disabled:opacity-40 hover:border-lizo-pink hover:text-text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lizo-pink focus-visible:ring-offset-2"
          aria-label={listening ? '停止语音输入' : '开始语音输入'}
          title={speechSupported ? (listening ? '停止语音输入' : '语音输入') : '当前浏览器不支持语音输入'}
        >
          {listening ? '◉' : '🎙'}
        </button>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="和 Lizo 说点什么…"
          className="flex-1 bg-transparent text-sm font-body text-text-primary placeholder:text-text-muted outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-10 h-10 rounded-full bg-lizo-pink flex items-center justify-center text-white text-sm disabled:opacity-40 hover:bg-lizo-pink-deep transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lizo-pink focus-visible:ring-offset-2"
          aria-label="发送"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
