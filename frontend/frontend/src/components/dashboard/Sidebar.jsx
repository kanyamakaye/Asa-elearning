import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { NAV_BY_ROLE } from './navConfig'
import { IconChevronLeft } from '../icons'

export default function Sidebar({ role, onNavigate, collapsed = false, onToggleCollapse, unreadMessageCount = 0 }) {
  const location = useLocation()
  const sections = NAV_BY_ROLE[role] ?? []
  const currentPath = `${location.pathname}${location.search}`

  function isActive(item) {
    if (item.end) return location.pathname === item.to
    const itemPath = item.to.split('?')[0]
    if (item.to.includes('?')) return currentPath === item.to
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)
  }

  return (
    // Light, off-white panel — matches the dashboard body (bg-navy-50/40)
    // and the topbar (bg-white/90) instead of standing apart as a dark block.
    <div className="flex h-full flex-col border-r border-navy-900/8 bg-navy-50/60 text-navy-800">
      <div className="flex items-center gap-2.5 border-b border-navy-900/8 px-4 py-5">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <span className="font-display truncate text-sm font-bold tracking-tight text-navy-900">Asa Academy</span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-navy-700/45 hover:bg-navy-900/5 hover:text-navy-900 lg:flex"
          >
            <IconChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && !collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-700/40">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                const Icon = item.icon
                const badgeCount = item.to === '/dashboard/messages' ? unreadMessageCount : 0
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? `${item.label}${badgeCount > 0 ? ` (${badgeCount} unread)` : ''}` : undefined}
                    className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-navy-900/8'
                        : 'text-navy-700/70 hover:bg-white/70 hover:text-navy-900'
                    }`}
                  >
                    {active && (
                      <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-400 to-brand-600" />
                    )}
                    {Icon && (
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-brand-500' : ''}`} />
                    )}
                    {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                    {badgeCount > 0 && (
                      <span
                        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ${
                          collapsed ? 'absolute -right-0.5 -top-0.5 h-4 w-4' : 'h-5 min-w-[1.25rem] px-1.5'
                        }`}
                        aria-label={`${badgeCount} unread message${badgeCount === 1 ? '' : 's'}`}
                      >
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
