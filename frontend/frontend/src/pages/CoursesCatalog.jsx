import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCategories, getCourses } from '../lib/queries'
import useCurrency from '../hooks/useCurrency'
import PageHeader from '../components/PageHeader'
import {
  IconArrowRight,
  IconBook,
  IconClock,
  IconClose,
  IconSearch,
  IconStar,
  IconUsers,
} from '../components/icons'

// The full, filterable, paginated course catalog — its own page rather than
// embedded in the homepage. It used to live inline in Home.jsx's "Popular
// courses" section, which made that section balloon to 7+ screens tall (a
// full category browser + infinite "Load More" doesn't belong in a homepage
// teaser). Home now shows a short curated preview (see components/Courses.jsx)
// that links here for the real browsing experience.
//
// Every filter lives in the URL (?q, ?category, ?level, ?price, ?sort), so the
// homepage's search box, category cards and mega menu all deep-link straight
// into a filtered view, and Back/refresh keep the user's place.
const LEVELS = ['beginner', 'intermediate', 'advanced']
const PRICES = ['free', 'paid']
const SORTS = {
  newest: '-created_at',
  priceLow: 'price',
  priceHigh: '-price',
  title: 'title',
}

export default function CoursesCatalog() {
  const { t } = useLanguage()
  const formatCurrency = useCurrency()
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'all'
  const level = searchParams.get('level') || 'all'
  const price = searchParams.get('price') || 'all'
  const sort = SORTS[searchParams.get('sort')] ? searchParams.get('sort') : 'newest'

  const [searchInput, setSearchInput] = useState(query)
  const [courses, setCourses] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const filters = {
    search: query,
    category: category === 'all' ? undefined : category,
    level: level === 'all' ? undefined : level,
    isFree: price === 'all' ? undefined : price === 'free',
    ordering: SORTS[sort],
  }

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {})
  }, [])

  // Keep the box in sync when ?q changes from outside (e.g. the navbar/hero).
  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPage(1)
    getCourses({ ...filters, page: 1 })
      .then((data) => {
        if (cancelled) return
        setCourses(data.results ?? data)
        setCount(data.count ?? (data.results ?? data).length)
        setNext(data.next ?? null)
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([])
          setCount(0)
          setNext(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, level, price, sort])

  function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    getCourses({ ...filters, page: nextPage })
      .then((data) => {
        setCourses((prev) => [...prev, ...(data.results ?? [])])
        setNext(data.next ?? null)
        setPage(nextPage)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  function setParam(key, value, fallback = 'all') {
    const params = new URLSearchParams(searchParams)
    if (!value || value === fallback) params.delete(key)
    else params.set(key, value)
    setSearchParams(params, { replace: true })
  }

  function handleSearch(e) {
    e.preventDefault()
    setParam('q', searchInput.trim(), '')
  }

  function clearAll() {
    setSearchInput('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const activeChips = [
    query && { key: 'q', label: `“${query}”` },
    category !== 'all' && {
      key: 'category',
      label: categories.find((c) => c.slug === category)?.name ?? category,
    },
    level !== 'all' && { key: 'level', label: t(`public.coursesCatalog.levels.${level}`) },
    price !== 'all' && { key: 'price', label: t(`public.coursesCatalog.prices.${price}`) },
  ].filter(Boolean)

  const totalCourses = categories.reduce((sum, c) => sum + (c.course_count ?? 0), 0)

  return (
    <>
      <PageHeader
        crumb={t('public.coursesCatalog.crumb')}
        eyebrow={t('public.coursesCatalog.eyebrow')}
        title={t('public.coursesCatalog.title')}
        subtitle={t('public.coursesCatalog.subtitle')}
      >
        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-black/20 dark:bg-navy-800">
          <IconSearch className="ml-3 h-5 w-5 shrink-0 text-navy-700/40 dark:text-navy-100/40" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('public.coursesCatalog.searchPlaceholder')}
            aria-label={t('public.coursesCatalog.search')}
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-navy-900 outline-none placeholder:text-navy-700/40 dark:text-white dark:placeholder:text-navy-100/40"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            {t('public.coursesCatalog.search')}
          </button>
        </form>
      </PageHeader>

      <section className="bg-navy-50/50 py-12 dark:bg-navy-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[280px_1fr] lg:px-8">
          {/* ── Filters ─────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/* Mobile: categories scroll sideways instead of wrapping into rows */}
            <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden">
              <CategoryPill active={category === 'all'} onClick={() => setParam('category', 'all')}>
                {t('public.coursesCatalog.all')}
              </CategoryPill>
              {categories.map((cat) => (
                <CategoryPill key={cat.id} active={category === cat.slug} onClick={() => setParam('category', cat.slug)}>
                  {cat.name}
                </CategoryPill>
              ))}
            </div>

            <div className="hidden rounded-2xl bg-white p-5 ring-1 ring-navy-900/8 lg:block dark:bg-navy-900 dark:ring-white/10">
              <FilterHeading>{t('public.coursesCatalog.categories')}</FilterHeading>
              <ul className="mt-3 space-y-1">
                <CategoryRow
                  active={category === 'all'}
                  label={t('public.coursesCatalog.all')}
                  count={totalCourses || null}
                  onClick={() => setParam('category', 'all')}
                />
                {categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    active={category === cat.slug}
                    label={cat.name}
                    count={cat.course_count}
                    onClick={() => setParam('category', cat.slug)}
                  />
                ))}
              </ul>

              <div className="mt-6 border-t border-navy-900/8 pt-5 dark:border-white/10">
                <FilterHeading>{t('public.coursesCatalog.level')}</FilterHeading>
                <OptionGroup
                  name="level"
                  value={level}
                  options={['all', ...LEVELS].map((v) => ({ value: v, label: t(`public.coursesCatalog.levels.${v}`) }))}
                  onChange={(v) => setParam('level', v)}
                />
              </div>

              <div className="mt-6 border-t border-navy-900/8 pt-5 dark:border-white/10">
                <FilterHeading>{t('public.coursesCatalog.price')}</FilterHeading>
                <OptionGroup
                  name="price"
                  value={price}
                  options={['all', ...PRICES].map((v) => ({ value: v, label: t(`public.coursesCatalog.prices.${v}`) }))}
                  onChange={(v) => setParam('price', v)}
                />
              </div>
            </div>
          </aside>

          {/* ── Results ─────────────────────────────────────────── */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-navy-700/70 dark:text-navy-100/70">
                <span className="font-semibold text-navy-900 dark:text-white">
                  {count === 1 ? t('public.coursesCatalog.showingOne') : t('public.coursesCatalog.showing', { count })}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Level + price as compact selects on small screens */}
                <SelectBox
                  className="lg:hidden"
                  label={t('public.coursesCatalog.level')}
                  value={level}
                  onChange={(v) => setParam('level', v)}
                  options={['all', ...LEVELS].map((v) => ({ value: v, label: t(`public.coursesCatalog.levels.${v}`) }))}
                />
                <SelectBox
                  className="lg:hidden"
                  label={t('public.coursesCatalog.price')}
                  value={price}
                  onChange={(v) => setParam('price', v)}
                  options={['all', ...PRICES].map((v) => ({ value: v, label: t(`public.coursesCatalog.prices.${v}`) }))}
                />
                <SelectBox
                  label={t('public.coursesCatalog.sortBy')}
                  value={sort}
                  onChange={(v) => setParam('sort', v, 'newest')}
                  options={Object.keys(SORTS).map((v) => ({ value: v, label: t(`public.coursesCatalog.sort.${v}`) }))}
                />
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      if (chip.key === 'q') setSearchInput('')
                      setParam(chip.key, null)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-sm text-brand-600 transition-colors hover:bg-brand-50 dark:bg-brand-500/15 dark:text-brand-300"
                  >
                    {chip.label}
                    <IconClose className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm text-navy-700/60 underline-offset-4 hover:text-navy-900 hover:underline dark:text-navy-100/60 dark:hover:text-white"
                >
                  {t('public.coursesCatalog.clearAll')}
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-navy-900/8 dark:bg-white/5 dark:ring-white/10" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-navy-900/15 bg-white py-16 text-center dark:border-white/15 dark:bg-transparent">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-700/50 dark:bg-white/5 dark:text-navy-100/50">
                  <IconSearch className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base text-navy-900 dark:text-white">{t('public.coursesCatalog.noneFoundTitle')}</h3>
                <p className="mt-1 max-w-sm text-sm text-navy-700/55 dark:text-navy-100/55">
                  {query
                    ? t('public.coursesCatalog.noneFoundWithQuery', { query })
                    : activeChips.length
                      ? t('public.coursesCatalog.noneFoundFiltered')
                      : t('public.coursesCatalog.noneFoundNoQuery')}
                </p>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 dark:text-white dark:ring-white/15 dark:hover:bg-white/5"
                  >
                    {t('public.coursesCatalog.clearAll')}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((c, i) => (
                    <CourseCard key={c.id} course={c} delay={(i % 6) * 70} t={t} formatCurrency={formatCurrency} />
                  ))}
                </div>

                {next && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 disabled:opacity-60 dark:bg-transparent dark:text-white dark:ring-white/15 dark:hover:bg-white/5"
                    >
                      {loadingMore ? t('public.coursesCatalog.loading') : t('public.coursesCatalog.loadMore')}
                      {!loadingMore && <IconArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function FilterHeading({ children }) {
  return (
    <h3 className="text-xs uppercase tracking-[0.12em] text-navy-700/55 dark:text-navy-100/55">{children}</h3>
  )
}

function CategoryRow({ active, label, count, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          active
            ? 'bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
            : 'text-navy-700/80 hover:bg-navy-50 dark:text-navy-100/75 dark:hover:bg-white/5'
        }`}
      >
        <span className="truncate">{label}</span>
        {count != null && (
          <span className="ml-2 shrink-0 text-xs text-navy-700/45 dark:text-navy-100/45">{count}</span>
        )}
      </button>
    </li>
  )
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
        active
          ? 'bg-navy-900 font-semibold text-white dark:bg-brand-500'
          : 'bg-white text-navy-700/75 ring-1 ring-navy-900/10 dark:bg-white/5 dark:text-navy-100/70 dark:ring-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function OptionGroup({ name, value, options, onChange }) {
  return (
    <div className="mt-3 space-y-2">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-700/80 dark:text-navy-100/75">
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 accent-brand-600"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

function SelectBox({ label, value, options, onChange, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-navy-900/10 dark:bg-navy-900 dark:ring-white/10 ${className}`}>
      <span className="text-navy-700/55 dark:text-navy-100/55">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-navy-900 outline-none dark:text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-navy-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function CourseCard({ course: c, delay, t, formatCurrency }) {
  return (
    <Link
      to={`/courses/${c.slug}`}
      className="group animate-fade-up flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10 dark:bg-navy-900 dark:ring-white/10"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <IconBook className="h-10 w-10 text-white/15" />
        </div>
        {c.image && (
          <img
            src={c.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs capitalize text-navy-900">
          {t(`public.coursesCatalog.levels.${c.level}`)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-xs uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {c.category?.name ?? t('public.coursesCatalog.generalCategory')}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-base leading-snug text-navy-900 dark:text-white">{c.title}</h3>
        <p className="mb-4 mt-1.5 truncate text-sm text-navy-700/65 dark:text-navy-100/65">{c.instructor?.full_name}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-navy-900/8 pt-4 text-xs text-navy-700/60 dark:border-white/10 dark:text-navy-100/60">
          <div className="flex items-center gap-3">
            {c.average_rating != null && (
              <span className="inline-flex items-center gap-1">
                <IconStar className="h-3.5 w-3.5 text-amber-400" />
                {c.average_rating}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              {t('public.coursesCatalog.hours', { count: c.duration_hours })}
            </span>
            {c.enrolled_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconUsers className="h-3.5 w-3.5" />
                {t('public.coursesCatalog.students', { count: c.enrolled_count })}
              </span>
            )}
          </div>
          <span className={`shrink-0 text-sm font-semibold ${c.is_free ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-900 dark:text-white'}`}>
            {c.is_free ? t('public.coursesCatalog.free') : formatCurrency(c.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
