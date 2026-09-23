import { useEffect, useState } from 'react'
import { getCategories } from '../lib/queries'
import { CATEGORY_ICONS } from './CategoryExplorer'
import { IconTarget } from './icons'

// Replaces a made-up "trusted by these companies" logo row — Asa Academy
// has no real enterprise customers to show, and inventing plausible-sounding
// names (see git history) reads as a fabricated partnership claim (the exact
// thing homedoc.md's trust section warns against). This earns credibility
// honestly instead, using the platform's own live category catalog.
export default function TrustStrip() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories()
      .then((data) => setCategories((data.results ?? data).slice(0, 6)))
      .catch(() => {})
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="border-b border-navy-900/8 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-navy-700/45">
          Skills that hiring teams are actively looking for
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? IconTarget
            return (
              <span
                key={cat.id}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700/60"
              >
                <Icon className="h-4 w-4 text-navy-700/35" />
                {cat.name}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
