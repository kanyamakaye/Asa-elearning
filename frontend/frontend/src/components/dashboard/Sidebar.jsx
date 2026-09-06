import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { NAV_BY_ROLE } from './navConfig'
import { IconChevronLeft } from '../icons'

export default function Sidebar({ role, onNavigate, collapsed = false, onToggleCollapse }) {
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
    <div className="flex h-full flex-col bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 text-white">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && <span className="font-display truncate text-sm font-bold tracking-tight">Asa Academy</span>}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-navy-100/50 hover:bg-white/10 hover:text-white lg:flex"
          >
            <IconChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 pb-6">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && !collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-100/35">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item)
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      collapsed ? 'justify-center' : ''
                    } ${active ? 'bg-white/10 text-white' : 'text-navy-100/65 hover:bg-white/5 hover:text-white'}`}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    {!collapsed && <span className="truncate">{item.label}</span>}
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
