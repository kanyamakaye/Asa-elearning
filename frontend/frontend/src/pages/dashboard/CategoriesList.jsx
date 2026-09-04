import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { IconPlus } from '../../components/icons'

export default function CategoriesList() {
  const { accessToken } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    apiFetch('/courses/categories/', { token: accessToken })
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await apiFetch('/courses/categories/', { method: 'POST', body: { name, description }, token: accessToken })
      setName('')
      setDescription('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Course Categories</h1>
        <p className="mt-1 text-sm text-navy-700/55">{categories.length} categories</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
        <label className="flex-1 basis-48">
          <span className="text-xs font-semibold text-navy-900">Name</span>
          <input
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <label className="flex-1 basis-64">
          <span className="text-xs font-semibold text-navy-900">Description</span>
          <input
            type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        <button
          type="submit" disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          <IconPlus className="h-4 w-4" />
          Add Category
        </button>
        {error && <p className="w-full text-xs font-medium text-red-600">{error}</p>}
      </form>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl bg-white p-5 ring-1 ring-navy-900/8">
              <h3 className="text-sm font-bold text-navy-900">{cat.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-navy-700/55">{cat.description || 'No description.'}</p>
              <p className="mt-3 text-xs font-semibold text-brand-500">{cat.course_count} courses</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
