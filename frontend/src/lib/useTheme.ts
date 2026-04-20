import { useState, useEffect } from 'react'

const THEME_KEY = 'lizo_theme'

export function useTheme() {
  const [night, setNight] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved) return saved === 'night'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch { return false }
  })

  useEffect(() => {
    if (night) {
      document.documentElement.setAttribute('data-theme', 'night')
      localStorage.setItem(THEME_KEY, 'night')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem(THEME_KEY, 'day')
    }
  }, [night])

  return { night, toggle: () => setNight(n => !n) }
}
