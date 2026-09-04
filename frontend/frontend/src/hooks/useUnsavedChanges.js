import { useEffect } from 'react'

/** Warns on a hard page close/reload while `dirty` is true. Router-internal
 * navigation (Cancel buttons, sidebar links) isn't covered — React Router 7
 * dropped the old `usePrompt`/`useBlocker`-on-BrowserRouter support, so those
 * flows should confirm explicitly via `window.confirm` at the call site. */
export default function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return
    function handler(e) {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}
