import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import logo from '../../assets/logo.png'
import { NAV_BY_ROLE } from './navConfig'
import { IconChevronDown, IconChevronLeft } from '../icons'

function isActiveItem(item, location, currentPath) {
  if (item.end) return location.pathname === item.to
  const itemPath = item.to.split('?')[0]
  if (item.to.includes('?')) return currentPath === item.to
  return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`)
}

export default function Sidebar({ role, onNavigate, collapsed = false, onToggleCollapse, unreadMessageCount = 0 }) {
  const location = useLocation()
  const { t } = useLanguage()
  const entries = NAV_BY_ROLE[role] ?? []
  const currentPath = `${location.pathname}${location.search}`

  function navLabel(key) {
    return t(`dashboardChrome.nav.${key}`)
  }

  function isActive(item) {
    return isActiveItem(item, location, currentPath)
  }

  // Exclusive accordion — only one submenu open at a time. Initialize to
  // whichever submenu (if any) contains the current route. Tracked by
  // entry.id (stable) rather than its translated label.
  const [openMenu, setOpenMenu] = useState(() => {
    const activeEntry = entries.find((entry) =>
      entry.children?.some((child) => isActiveItem(child, location, currentPath))
    )
    return activeEntry?.id ?? null
  })

  // Switch to the submenu containing the active route when navigating
  // directly to it (e.g. via a link elsewhere in the app), closing whatever
  // else was open.
  useEffect(() => {
    const activeEntry = entries.find((entry) =>
      entry.children?.some((child) => isActiveItem(child, location, currentPath))
    )
    if (activeEntry) setOpenMenu(activeEntry.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  function toggleMenu(id) {
    setOpenMenu((prev) => (prev === id ? null : id))
  }

  function linkClasses(active) {
    return `relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
      collapsed ? 'justify-center' : ''
    } ${
      active
        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-navy-900/8 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10'
        : 'text-navy-700/70 hover:bg-white/70 hover:text-navy-900 dark:text-navy-100/70 dark:hover:bg-white/5 dark:hover:text-white'
    }`
  }

  return (
    // Light, off-white panel — matches the dashboard body (bg-navy-50/40)
    // and the topbar (bg-white/90) instead of standing apart as a dark block.
    <div className="flex h-full flex-col border-r border-navy-900/8 bg-navy-50/60 text-navy-800 dark:border-white/10 dark:bg-navy-900 dark:text-navy-100">
      <div className="flex items-center gap-2.5 border-b border-navy-900/8 px-4 py-5 dark:border-white/10">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <img src={logo} alt="Asa Academy" className="h-8 w-8 shrink-0 object-contain" />
          {!collapsed && (
            <span className="font-display truncate text-sm font-bold tracking-tight text-navy-900 dark:text-white">Asa Academy</span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? t('dashboardChrome.sidebar.expand') : t('dashboardChrome.sidebar.collapse')}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-navy-700/45 hover:bg-navy-900/5 hover:text-navy-900 dark:text-navy-100/45 dark:hover:bg-white/5 dark:hover:text-white lg:flex"
          >
            <IconChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-5">
        {entries.map((entry) => {
          if (!entry.children) {
            const active = isActive(entry)
            const Icon = entry.icon
            const label = navLabel(entry.labelKey)
            const badgeCount = entry.to === '/dashboard/messages' ? unreadMessageCount : 0
            return (
              <Link
                key={entry.id}
                to={entry.to}
                onClick={onNavigate}
                title={collapsed ? `${label}${badgeCount > 0 ? ` (${badgeCount} unread)` : ''}` : undefined}
                className={linkClasses(active)}
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-400 to-brand-600" />
                )}
                {Icon && <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-brand-500' : ''}`} />}
                {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
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
          }

          // Submenu: collapsed sidebar has no room for a flyout, so its
          // header just links straight to the first child instead.
          const hasActiveChild = entry.children.some(isActive)
          const Icon = entry.icon
          const label = navLabel(entry.labelKey)
          if (collapsed) {
            return (
              <Link
                key={entry.id}
                to={entry.children[0].to}
                onClick={onNavigate}
                title={label}
                className={linkClasses(hasActiveChild)}
              >
                {Icon && <Icon className={`h-4 w-4 shrink-0 transition-colors ${hasActiveChild ? 'text-brand-500' : ''}`} />}
              </Link>
            )
          }

          const open = openMenu === entry.id
          return (
            <div key={entry.id}>
              <button
                type="button"
                onClick={() => toggleMenu(entry.id)}
                aria-expanded={open}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  hasActiveChild && !open
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-navy-900/8 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10'
                    : 'text-navy-700/70 hover:bg-white/70 hover:text-navy-900 dark:text-navy-100/70 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                {Icon && (
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${hasActiveChild ? 'text-brand-500' : ''}`} />
                )}
                <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                <IconChevronDown className={`h-3.5 w-3.5 shrink-0 text-navy-700/40 dark:text-navy-100/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="mt-0.5 space-y-0.5 border-l border-navy-900/8 pl-3.5 dark:border-white/10">
                  {entry.children.map((child) => {
                    const active = isActive(child)
                    const ChildIcon = child.icon
                    const childLabel = navLabel(child.labelKey)
                    return (
                      <Link
                        key={child.id}
                        to={child.to}
                        onClick={onNavigate}
                        className={`relative flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-white text-brand-600 shadow-sm ring-1 ring-navy-900/8 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10'
                            : 'text-navy-700/60 hover:bg-white/70 hover:text-navy-900 dark:text-navy-100/60 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                      >
                        {ChildIcon && (
                          <ChildIcon className={`h-3.5 w-3.5 shrink-0 transition-colors ${active ? 'text-brand-500' : ''}`} />
                        )}
                        <span className="min-w-0 flex-1 truncate">{childLabel}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
