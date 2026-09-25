import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function PageHeader({ eyebrow, title, subtitle, crumb, children }) {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(59,107,255,0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(111,143,255,0.3), transparent 45%)',
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-16 text-center lg:px-8 lg:py-20">
        <nav className="flex items-center justify-center gap-2 text-xs font-medium text-navy-100/50">
          <Link to="/" className="transition-colors hover:text-white">
            {t('public.pageHeader.home')}
          </Link>
          <span>/</span>
          <span className="text-navy-100/80">{crumb}</span>
        </nav>

        {eyebrow && (
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-navy-100/70">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
