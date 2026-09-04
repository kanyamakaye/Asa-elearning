import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch } from '../icons'

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}#courses` : '/#courses')
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search courses…"
        className="w-full rounded-full bg-navy-50 py-2 pl-10 pr-4 text-sm text-navy-900 placeholder:text-navy-700/40 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </form>
  )
}
