import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconChevronDown, IconLogout, IconSettings, IconUsers } from '../icons'

const ROLE_LABELS = {
  admin: 'Administrator',
  academic_manager: 'Academic Manager',
  instructor: 'Instructor',
  student: 'Student',
  content_manager: 'Content Manager',
  support_staff: 'Support Staff',
}

export default function UserMenu() {
  const { user, logout } = useAuth()
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-navy-50"
      >
        {user.profile_picture ? (
          <img src={user.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
            {(user.first_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold text-navy-900">{user.first_name || user.username}</span>
          <span className="block text-[10px] text-navy-700/50">{ROLE_LABELS[user.user_type] ?? user.user_type}</span>
        </span>
        <IconChevronDown className="h-3.5 w-3.5 text-navy-700/40" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-white py-1.5 shadow-xl ring-1 ring-navy-900/8">
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50"
          >
            <IconUsers className="h-4 w-4 text-navy-700/50" />
            My Profile
          </Link>
          <Link
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50"
          >
            <IconSettings className="h-4 w-4 text-navy-700/50" />
            Settings
          </Link>
          <div className="my-1 border-t border-navy-900/8" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <IconLogout className="h-4 w-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
