import { getPlatformSettings } from '../services/settingsService'

/** Asa Academy's display currency is admin-configurable (Settings page ->
 * Platform Settings), not hardcoded. This module holds the currently-active
 * currency in memory — loaded once at app boot (see main.jsx) — so every
 * price/amount display formats consistently without each component fetching
 * it separately. Falls back to RWF (the platform's original default) until
 * the fetch resolves or if it fails. Changing the currency, in general,
 * relabels prices; it does not convert existing numeric amounts.
 *
 * The initial load happens after first paint, so components that render a
 * price without their own data fetch in between (nothing async to "catch"
 * the update) need the reactive useCurrency() hook (./hooks/useCurrency.js)
 * instead of calling formatCurrency directly, or they'll get stuck showing
 * the RWF fallback even after the real currency loads. */
let current = { code: 'RWF', symbol: 'RWF' }
const listeners = new Set()

export function setCurrency({ currency_code, currency_symbol } = {}) {
  if (!currency_code) return
  current = { code: currency_code, symbol: currency_symbol || currency_code }
  listeners.forEach((fn) => fn(current))
}

export function getCurrency() {
  return current
}

export function subscribeCurrency(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function loadCurrency() {
  try {
    const data = await getPlatformSettings()
    setCurrency(data)
  } catch {
    // Keep the RWF fallback — a settings-fetch failure shouldn't block the app.
  }
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0
  return `${current.symbol} ${num.toLocaleString()}`
}
