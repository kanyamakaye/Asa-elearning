import { useEffect } from 'react'

// Elements a visitor still needs to select/copy/paste in normally — blocking
// paste into a password field (or copy out of one) breaks password managers
// and is explicitly against real security guidance, so this only ever
// restricts *displayed content* (lesson text, homepage copy, dashboards),
// never anything the user is actively typing into.
function isEditableTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/** Site-wide deterrent against casually copying page content — right-click,
 * text selection, and copy/cut are blocked outside form fields. This is NOT
 * real protection (page source, browser devtools, and screenshots all still
 * work regardless), just a speed bump against casual copy-paste, mirrored
 * by the `user-select: none` rule in index.css. Mounted once in App(). */
export default function useContentProtection() {
  useEffect(() => {
    function blockUnlessEditable(e) {
      if (!isEditableTarget(e.target)) e.preventDefault()
    }

    document.addEventListener('contextmenu', blockUnlessEditable)
    document.addEventListener('copy', blockUnlessEditable)
    document.addEventListener('cut', blockUnlessEditable)

    return () => {
      document.removeEventListener('contextmenu', blockUnlessEditable)
      document.removeEventListener('copy', blockUnlessEditable)
      document.removeEventListener('cut', blockUnlessEditable)
    }
  }, [])
}
