/** Asa Academy prices and payments are denominated in Rwandan Francs.
 * Centralized so every price/amount display formats the same way. */
export function formatCurrency(amount) {
  const num = Number(amount) || 0
  return `RWF ${num.toLocaleString()}`
}
