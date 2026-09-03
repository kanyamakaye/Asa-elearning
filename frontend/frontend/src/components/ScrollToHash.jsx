import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Runs on every route/hash change. Cross-page anchor links (e.g. "/#courses"
// clicked from the Contact page) land on Home first, then this scrolls to
// the target section once it has mounted; a plain route change scrolls to top.
export default function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash && location.hash.length > 1) {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [location.pathname, location.hash, location.key])

  return null
}
