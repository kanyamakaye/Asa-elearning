import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from './navConfig'
import NotificationPanel from './NotificationPanel'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import { IconMenu } from '../icons'

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuth()
  const roleLabel = ROLE_LABELS[user?.user_type]

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-navy-900/8 bg-white/90 px-4 py-3 backdrop-blur-md lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 lg:hidden"
        aria-label="Open menu"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {title && <h1 className="hidden text-base font-bold text-navy-900 sm:block">{title}</h1>}

      {roleLabel && (
        <div className="hidden items-center gap-2 rounded-full bg-navy-50 px-4 py-1.5 text-xs font-semibold text-navy-700/70 md:flex">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span className="text-navy-900">Asa Academy</span>
          <span className="text-navy-700/30">|</span>
          <span>{roleLabel} Portal</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <SearchBar className="hidden w-56 md:block" />
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  )
}
