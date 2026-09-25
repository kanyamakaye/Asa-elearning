import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { ROLE_LABEL_KEYS } from './navConfig'
import { IconChevronDown, IconLogout, IconSettings, IconUsers } from '../icons'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  function handleLogout() {
    logout()
    navigate('/')
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!user) return null

  const roleLabelKey = ROLE_LABEL_KEYS[user.user_type]
  const roleLabel = roleLabelKey ? t(`dashboardChrome.roles.${roleLabelKey}`) : user.user_type

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-navy-50 dark:hover:bg-white/5"
      >
        {user.profile_picture ? (
          <img src={user.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white dark:bg-brand-500">
            {(user.first_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold text-navy-900 dark:text-white">{user.first_name || user.username}</span>
          <span className="block text-[10px] text-navy-700/50 dark:text-navy-100/50">{roleLabel}</span>
        </span>
        <IconChevronDown className="h-3.5 w-3.5 text-navy-700/40 dark:text-navy-100/40" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-white py-1.5 shadow-xl ring-1 ring-navy-900/8 dark:bg-navy-800 dark:ring-white/10">
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/5"
          >
            <IconUsers className="h-4 w-4 text-navy-700/50 dark:text-navy-100/50" />
            {t('dashboardChrome.userMenu.myProfile')}
          </Link>
          <Link
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/5"
          >
            <IconSettings className="h-4 w-4 text-navy-700/50 dark:text-navy-100/50" />
            {t('dashboardChrome.nav.settings')}
          </Link>
          <div className="my-1 border-t border-navy-900/8 dark:border-white/10" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <IconLogout className="h-4 w-4" />
            {t('public.nav.logOut')}
          </button>
        </div>
      )}
    </div>
  )
}
