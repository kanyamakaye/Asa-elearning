// Mirrors accounts.validators.ComplexityValidator + Django's
// MinimumLengthValidator on the backend — client-side feedback only, the
// backend is still the source of truth.
export const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'An uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'A lowercase letter' },
  { test: (v) => /\d/.test(v), label: 'A number' },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: 'A special character' },
]
