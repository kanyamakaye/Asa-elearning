import { useTheme } from '../context/ThemeContext'
import { IconMoon, IconSun } from './icons'

/** Sun/moon toggle — usable in both the light public navbar and the
 * dashboard topbar, so it takes no assumptions about surrounding colors
 * beyond the shared navy/white tokens every surface already uses. */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy-700/70 ring-1 ring-navy-900/10 transition-colors hover:bg-navy-50 hover:text-navy-900 dark:text-navy-100/70 dark:ring-white/15 dark:hover:bg-white/10 dark:hover:text-white ${className}`}
    >
      {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
    </button>
  )
}
