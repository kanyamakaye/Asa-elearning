import { useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { IconChevronDown, IconGlobe } from './icons'

/** Dropdown language switcher — usable in both the public navbar and the
 * dashboard topbar. Persists via LanguageContext (localStorage), so a
 * choice made on the homepage carries into the dashboard after login. */
export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, languages } = useLanguage()
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)

  function handleEnter() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const active = languages.find((l) => l.code === language) ?? languages[0]

  return (
    <div className={`relative ${className}`} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-navy-700/70 ring-1 ring-navy-900/10 transition-colors hover:bg-navy-50 hover:text-navy-900 dark:text-navy-100/70 dark:ring-white/15 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <IconGlobe className="h-4 w-4" />
        <span className="hidden sm:inline">{active.code.toUpperCase()}</span>
        <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-xl shadow-navy-900/15 ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === language}
              onClick={() => {
                setLanguage(lang.code)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                lang.code === language
                  ? 'bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'text-navy-700/80 hover:bg-navy-50 dark:text-navy-100/80 dark:hover:bg-white/5'
              }`}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
