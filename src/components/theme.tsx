import { useEffect, useState } from 'react'
import { Sun, Moon } from '@/components/icons'
import { cn } from '@/lib/utils'

export type Theme = 'light' | 'dark'

/** Script injecté dans le <head> pour appliquer le thème avant l'hydratation (anti-flash). */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setMounted(true)
  }, [])

  const setTheme = (t: Theme) => {
    applyTheme(t)
    try {
      localStorage.setItem('theme', t)
    } catch {
      /* localStorage indisponible */
    }
    setThemeState(t)
  }

  return {
    theme,
    mounted,
    setTheme,
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, mounted, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={cn(
        'grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
        className,
      )}
    >
      {/* Avant hydratation, on rend les deux icônes superposées pour éviter tout mismatch */}
      {mounted ? (
        isDark ? <Sun className="size-5" /> : <Moon className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  )
}
