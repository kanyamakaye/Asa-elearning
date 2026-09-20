import { useEffect, useState } from 'react'
import { formatCurrency, subscribeCurrency } from '../lib/currency'

/** Reactive version of formatCurrency — re-renders the calling component
 * when the platform currency changes (either the initial async load at app
 * boot, or an admin updating it from Settings). Use this instead of the
 * plain formatCurrency import in any component that might render a price
 * before/without its own data fetch resolving. */
export default function useCurrency() {
  const [, forceRender] = useState(0)
  useEffect(() => {
    // The initial currency load (main.jsx) can resolve before this effect
    // subscribes, since it starts before React even mounts — re-render once
    // on mount to pick up whatever the current value already is, then stay
    // subscribed for any later change (e.g. an admin updating Settings).
    forceRender((n) => n + 1)
    return subscribeCurrency(() => forceRender((n) => n + 1))
  }, [])
  return formatCurrency
}
