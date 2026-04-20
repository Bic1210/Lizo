import { Link, useLocation } from 'react-router-dom'
import { focusRing } from '../../lib/styles'
import { useTheme } from '../../lib/useTheme'

const LINKS = [
  { to: '/',      label: '首页' },
  { to: '/chat',  label: '聊天' },
  { to: '/soul',  label: '灵魂空间' },
  { to: '/about', label: '关于' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const { night, toggle } = useTheme()
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-bg-elevated/90 backdrop-blur-sm border-b border-lizo-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link
          to="/"
          className={`font-display font-bold text-text-primary text-lg tracking-tight ${focusRing}`}
        >
          Lizo
        </Link>
        <div className="flex items-center gap-0.5">
          {LINKS.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`
                  px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-body
                  transition-colors duration-200 ${focusRing}
                  ${active
                    ? 'bg-lizo-cream text-text-primary font-semibold'
                    : 'text-text-muted hover:text-text-secondary hover:bg-lizo-cream/40'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
          <button
            onClick={toggle}
            className={`px-2.5 py-1.5 rounded-lg text-sm transition-colors duration-200 ${focusRing}`}
            aria-label={night ? '切换白天模式' : '切换夜间模式'}
          >
            {night ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
