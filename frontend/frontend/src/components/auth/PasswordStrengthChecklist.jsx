import { useLanguage } from '../../context/LanguageContext'
import { PASSWORD_RULES } from '../../lib/passwordRules'
import { IconCheck } from '../icons'

export default function PasswordStrengthChecklist({ password }) {
  const { t } = useLanguage()
  const checks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  return (
    <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {checks.map((c) => (
        <li key={c.key} className={`flex items-center gap-1.5 text-xs ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-700/40 dark:text-navy-100/40'}`}>
          <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${c.met ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-navy-900/8 dark:bg-white/10'}`}>
            {c.met && <IconCheck className="h-2.5 w-2.5" />}
          </span>
          {t(`auth.passwordRules.${c.key}`)}
        </li>
      ))}
    </ul>
  )
}
