import { create } from 'zustand'

type Theme = 'dark' | 'light' | 'system'

interface ThemeState {
  theme: Theme
  effectiveTheme: 'dark' | 'light'
  
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initTheme: () => void
}

const THEME_KEY = 'geretondjai_theme'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function applyTheme(theme: 'dark' | 'light'): void {
  const root = document.documentElement
  
  // Remove both classes first
  root.classList.remove('light', 'dark')
  
  // Add the appropriate class
  root.classList.add(theme)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#221910' : '#f48c25')
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  effectiveTheme: 'light',

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    applyTheme(effectiveTheme)
    
    set({ theme, effectiveTheme })
  },

  toggleTheme: () => {
    const currentTheme = get().effectiveTheme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme(newTheme)
    
    set({ theme: newTheme, effectiveTheme: newTheme })
  },

  initTheme: () => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    const theme = stored || 'light'
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
    
    applyTheme(effectiveTheme)
    set({ theme, effectiveTheme })

    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = get().theme
        if (currentTheme === 'system') {
          const newEffective = e.matches ? 'dark' : 'light'
          applyTheme(newEffective)
          set({ effectiveTheme: newEffective })
        }
      })
    }
  }
}))
