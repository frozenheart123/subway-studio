import { create } from 'zustand'

export type Theme = 'dark' | 'light'
const KEY = 'subway-studio:theme'

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1510' : '#f3eee2')
}

interface ThemeState { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }
export const useTheme = create<ThemeState>((set, get) => {
  const theme = initial()
  apply(theme)
  return {
    theme,
    setTheme: (t) => {
      apply(t)
      set({ theme: t })
      try { localStorage.setItem(KEY, t) } catch { /* ignore */ }
    },
    toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  }
})
