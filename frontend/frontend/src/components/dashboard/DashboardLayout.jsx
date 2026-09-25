import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useUnreadMessages from '../../hooks/useUnreadMessages'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { IconClose } from '../icons'

function readCollapsed() {
  try {
    return localStorage.getItem('asa_sidebar_collapsed') === 'true'
  } catch {
    return false
  }
}

export default function DashboardLayout() {
  const { user, accessToken } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const { unreadCount } = useUnreadMessages(accessToken)

  useEffect(() => {
    try {
      localStorage.setItem('asa_sidebar_collapsed', String(collapsed))
    } catch {
      // ignore (private browsing / storage disabled)
    }
  }, [collapsed])

  const sidebarWidth = collapsed ? 'w-20' : 'w-64'

  return (
    <div className="flex min-h-screen bg-navy-50/40 dark:bg-navy-950">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 lg:block ${sidebarWidth}`}>
        <div className={`fixed h-screen ${sidebarWidth} transition-[width]`}>
          <Sidebar
            role={user?.user_type}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            unreadMessageCount={unreadCount}
          />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/5 text-navy-700 hover:bg-navy-900/10 dark:bg-white/10 dark:text-navy-100 dark:hover:bg-white/15"
                aria-label="Close menu"
              >
                <IconClose className="h-4 w-4" />
              </button>
              <Sidebar role={user?.user_type} onNavigate={() => setMobileOpen(false)} unreadMessageCount={unreadCount} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
