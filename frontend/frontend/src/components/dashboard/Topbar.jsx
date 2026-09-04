import NotificationPanel from './NotificationPanel'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import { IconMenu } from '../icons'

export default function Topbar({ onMenuClick, title }) {
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

      <div className="ml-auto flex items-center gap-3">
        <SearchBar className="hidden w-56 md:block" />
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  )
}
