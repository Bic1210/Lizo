import { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { apiFetch } from '../../lib/api'

interface Message {
  id: string
  role: 'user' | 'lizo'
  text: string
  emotion?: string
}

function newMsg(role: Message['role'], text: string, emotion?: string): Message {
  return { id: crypto.randomUUID(), role, text, emotion }
}

const THINKING_PHRASES = [
  '嗯…',
  '让我想想…',
  '（尾巴摆了摆）',
  '我在听',
  '（翻了翻口袋里的记忆）',
  '好问题',
  '…',
]

const FIRST_VISIT_KEY = 'lizo_first_visit'
const LAST_VISIT_KEY  = 'lizo_last_visit'
const HISTORY_KEY     = 'lizo_chat_history'
const MAX_HISTORY     = 50
const NAV_HEIGHT_PX   = 56

function getTimeGreeting(): { text: string; emotion: string } {
  const h = new Date().getHours()
  if (h >= 0  && h < 5)  return { text: '深夜了，你还在啊。',                        emotion: '平静' }
  if (h >= 5  && h < 9)  return { text: '早～你起这么早啊。',                        emotion: '开心' }
  if (h >= 9  && h < 12) return { text: '上午好。有什么想说的吗？',                  emotion: '平静' }
  if (h >= 12 && h < 14) return { text: '吃饭了吗？（Lizo 自己不用吃，但关心你）',  emotion: '开心' }
  if (h >= 14 && h < 18) return { text: '下午三点的困，最难熬了。',                  emotion: '疲惫' }
  if (h >= 18 && h < 21) return { text: '晚上了。今天怎么样？',                      emotion: '平静' }
  return                         { text: '夜里总是话多，我听着。',                    emotion: '平静' }
}

// 修复 M-3：拆分为纯读取函数（无副作用）和写入函数，避免 StrictMode 双调用问题

function computeGreeting(): { text: string; emotion: string } {
  const now        = Date.now()
  const firstVisit = localStorage.getItem(FIRST_VISIT_KEY)
  const lastVisit  = localStorage.getItem(LAST_VISIT_KEY)

  if (!firstVisit) {
    return { text: '嗨，第一次见面。我叫 Lizo，很高兴认识你。', emotion: '开心' }
  }
  if (!lastVisit) return getTimeGreeting()

  const hoursSince = (now - parseInt(lastVisit)) / 3_600_000
  const daysSince  = hoursSince / 24

  if (hoursSince < 1)  return getTimeGreeting()
  if (daysSince  < 1)  return { text: '又回来了。',                                          emotion: '开心' }
  if (daysSince  < 3)  return { text: '好几天没来了，最近怎么样？',                          emotion: '平静' }
  if (daysSince  < 7)  return { text: `${Math.floor(daysSince)} 天没来了……有想我吗？`,       emotion: '平静' }
  return                      { text: `${Math.floor(daysSince)} 天了。我以为你忘记我了。`,   emotion: '难过' }
}

function recordVisit() {
  const now = Date.now()
  if (!localStorage.getItem(FIRST_VISIT_KEY)) {
    localStorage.setItem(FIRST_VISIT_KEY, String(now))
  }
  localStorage.setItem(LAST_VISIT_KEY, String(now))
}

function readViewportHeight() {
  if (typeof window === 'undefined') return null
  return Math.round(window.visualViewport?.height ?? window.innerHeight)
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        const parsed: Message[] = JSON.parse(saved)
        if (parsed.length > 0) return parsed
      }
    } catch { /* storage 读取失败静默处理 */ }
    const g = computeGreeting()
    return [newMsg('lizo', g.text, g.emotion)]
  })
  const [loading, setLoading] = useState(false)
  const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0])
  const [viewportHeight, setViewportHeight] = useState<number | null>(readViewportHeight)
  const bottomRef = useRef<HTMLDivElement>(null)
  // 修复 C-1：AbortController ref，用于组件卸载时取消飞行中的请求
  const abortRef = useRef<AbortController | null>(null)

  // 修复 M-3：只在挂载时执行一次写入副作用
  useEffect(() => {
    recordVisit()
  }, [])

  // 修复 C-1：组件卸载时 abort 所有飞行中请求
  useEffect(() => () => { abortRef.current?.abort() }, [])

  // P5: iOS 键盘弹起时，跟随 visualViewport 收缩聊天区域，避免输入栏被遮住
  useEffect(() => {
    const visualViewport = window.visualViewport
    const syncViewportHeight = () => setViewportHeight(readViewportHeight())

    syncViewportHeight()
    visualViewport?.addEventListener('resize', syncViewportHeight)
    visualViewport?.addEventListener('scroll', syncViewportHeight)
    window.addEventListener('resize', syncViewportHeight)

    return () => {
      visualViewport?.removeEventListener('resize', syncViewportHeight)
      visualViewport?.removeEventListener('scroll', syncViewportHeight)
      window.removeEventListener('resize', syncViewportHeight)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 修复 M-2：loading 期间跳过 localStorage 写入，避免写入包含 placeholder 的消息
  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
    } catch { /* QuotaExceeded */ }
  }, [messages, loading])

  async function handleSend(text: string) {
    // 修复 C-1：取消上一个还在飞行中的请求
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setThinkingPhrase(THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)])
    setMessages(prev => [...prev, newMsg('user', text)])
    setLoading(true)

    try {
      const res = await apiFetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: ctrl.signal,
      })
      const json = await res.json()
      if (json.status === 'success') {
        setMessages(prev => [...prev, newMsg('lizo', json.data.reply, json.data.emotion)])
      } else {
        setMessages(prev => [...prev, newMsg('lizo', '…（Lizo 走神了一下，再说一次？）')])
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setMessages(prev => [...prev, newMsg('lizo', '…（信号好像不太好，稍后再试试）')])
    } finally {
      setLoading(false)
    }
  }

  const chatHeight = viewportHeight === null
    ? 'calc(100dvh - 3.5rem)'
    : `${Math.max(320, viewportHeight - NAV_HEIGHT_PX)}px`

  return (
    <div className="bg-bg-base flex flex-col" style={{ height: chatHeight }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-lizo-cream bg-bg-elevated">
        <div className="w-8 h-8 rounded-full bg-lizo-cream flex items-center justify-center text-lg animate-breathe">
          🦎
        </div>
        <div>
          <p className="text-sm font-display font-semibold text-text-primary">Lizo</p>
          <p className="text-xs text-text-muted font-body">在线</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 pb-6 flex flex-col gap-3 max-w-2xl w-full mx-auto"
        style={{ scrollPaddingBottom: '1rem' }}
      >
        {messages.map(m => (
          <ChatMessage key={m.id} role={m.role} text={m.text} emotion={m.emotion} />
        ))}

        {loading && (
          <div className="flex items-end gap-2 animate-fade-up">
            <div className="w-6 h-6 rounded-full bg-lizo-cream flex-shrink-0 flex items-center justify-center text-sm">
              🦎
            </div>
            <div className="bg-bg-surface border border-lizo-cream rounded-lg rounded-bl-sm px-4 py-3">
              <span className="text-sm font-body text-text-muted italic">{thinkingPhrase}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-muted ml-1.5 animate-breathe" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  )
}
