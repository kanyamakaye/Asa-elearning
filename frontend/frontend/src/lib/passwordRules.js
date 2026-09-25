// Mirrors accounts.validators.ComplexityValidator + Django's
// MinimumLengthValidator on the backend — client-side feedback only, the
// backend is still the source of truth. `key` resolves to
// auth.passwordRules.<key> wherever this is rendered.
export const PASSWORD_RULES = [
  { key: 'minLength', test: (v) => v.length >= 8 },
  { key: 'uppercase', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', test: (v) => /[a-z]/.test(v) },
  { key: 'number', test: (v) => /\d/.test(v) },
  { key: 'specialChar', test: (v) => /[^A-Za-z0-9]/.test(v) },
]
