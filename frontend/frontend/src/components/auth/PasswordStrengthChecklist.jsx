import { PASSWORD_RULES } from '../../lib/passwordRules'
import { IconCheck } from '../icons'

export default function PasswordStrengthChecklist({ password }) {
  const checks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  return (
    <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {checks.map((c) => (
        <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-emerald-600' : 'text-navy-700/40'}`}>
          <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${c.met ? 'bg-emerald-100' : 'bg-navy-900/8'}`}>
            {c.met && <IconCheck className="h-2.5 w-2.5" />}
          </span>
          {c.label}
        </li>
      ))}
    </ul>
  )
}
