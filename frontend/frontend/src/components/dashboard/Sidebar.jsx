import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { NAV_BY_ROLE } from './navConfig'

export default function Sidebar({ role, onNavigate }) {
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
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-5">
        <img src={logo} alt="Asa Academy" className="h-8 w-8 object-contain" />
        <span className="text-sm font-bold tracking-tight">Asa Academy</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
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
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-white/10 text-white' : 'text-navy-100/65 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{item.label}</span>
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
