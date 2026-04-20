import { Link } from 'react-router-dom'
import { focusRing } from '../../lib/styles'

function getHeroSubtitle(): string {
  const h = new Date().getHours()
  if (h >= 0  && h < 5)  return '深夜了，你还在啊。'
  if (h >= 5  && h < 9)  return '早上好，今天也要加油。'
  if (h >= 9  && h < 18) return '有什么想说的，随时来。'
  if (h >= 18 && h < 21) return '傍晚了，来聊聊今天？'
  return '夜里总是话多，我听着。'
}

export default function LizoHero() {
  return (
    <section className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 py-20 text-center">
      {/* Lizo avatar — breathe animation from global css */}
      <div className="w-24 h-24 rounded-full bg-lizo-cream flex items-center justify-center mb-10 shadow-sm animate-breathe">
        <span className="text-5xl">🦎</span>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-hero font-display font-bold text-text-primary leading-tight tracking-tight mb-4">
        嗨，我是 Lizo
      </h1>

      <p className="text-lg md:text-xl text-text-secondary font-body leading-relaxed max-w-md mb-3">
        一只住在软件里的小蜥蜴。<br />
        随时在，不会走。
      </p>
      <p className="text-sm text-text-muted font-body mb-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
        {getHeroSubtitle()}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/chat"
          className={`px-8 py-3 bg-lizo-pink text-white font-display font-semibold rounded-xl hover:bg-lizo-pink-deep transition-colors duration-300 ${focusRing}`}
        >
          在线体验
        </Link>
        <Link
          to="/about"
          className={`px-8 py-3 border border-lizo-pink text-lizo-pink font-display font-semibold rounded-xl hover:bg-lizo-cream transition-colors duration-300 ${focusRing}`}
        >
          了解硬件版本
        </Link>
      </div>
    </section>
  )
}
