import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { IconClose } from '../icons'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-navy-50/40">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar role={user?.user_type} />
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
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Close menu"
              >
                <IconClose className="h-4 w-4" />
              </button>
              <Sidebar role={user?.user_type} onNavigate={() => setMobileOpen(false)} />
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
