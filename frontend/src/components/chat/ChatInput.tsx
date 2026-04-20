import { useState, type KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSend() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-gradient-to-t from-bg-base via-bg-base to-transparent"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-3 bg-bg-elevated border border-lizo-cream rounded-full px-5 py-3 shadow-sm focus-within:border-lizo-pink transition-colors duration-300">
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
