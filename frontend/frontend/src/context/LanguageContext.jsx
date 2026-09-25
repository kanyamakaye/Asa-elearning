import { createContext, useContext, useMemo, useState } from 'react'
import { dictionaries, FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'asa_lang'

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored
  } catch {
    // localStorage unavailable — fall through to the default.
  }
  return FALLBACK_LANGUAGE
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  function setLanguage(code) {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === code)) return
    setLanguageState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // Not persisted this session, but switching still works in-memory.
    }
  }

  // t('namespace.some.nested.key', { name: 'Ada' }) — looks up the active
  // language's dictionary, falls back to English, then to the key itself
  // (so a missing translation is visible/searchable in the UI instead of
  // silently rendering blank) rather than ever throwing.
  //
  // Simple i18next-style pluralization: when vars.count is a number other
  // than 1, `${key}_plural` is tried first (falling back to the bare key if
  // that variant doesn't exist) — e.g. lessonCount / lessonCount_plural.
  const t = useMemo(() => {
    return (key, vars) => {
      const active = dictionaries[language] ?? dictionaries[FALLBACK_LANGUAGE]
      const lookupKey = typeof vars?.count === 'number' && vars.count !== 1 ? `${key}_plural` : key

      let value = getPath(active, lookupKey)
      if (value === undefined) value = getPath(active, key)
      if (value === undefined) value = getPath(dictionaries[FALLBACK_LANGUAGE], lookupKey)
      if (value === undefined) value = getPath(dictionaries[FALLBACK_LANGUAGE], key)
      if (value === undefined) value = key

      if (vars && typeof value === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replaceAll(`{{${k}}}`, v)
        })
      }
      return value
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: SUPPORTED_LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
