import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from '../components/icons'

const infoCardConfig = [
  { key: 'email', icon: IconMail, href: 'mailto:support@asaacademy.com' },
  { key: 'call', icon: IconPhone, href: 'tel:+254700123456' },
  { key: 'visit', icon: IconMapPin, href: 'https://www.openstreetmap.org/?mlat=-1.2667&mlon=36.8118#map=15/-1.2667/36.8118' },
]

const subjectKeys = ['general', 'courseSupport', 'technical', 'partnership', 'instructorApplication', 'billing']

const officeHourKeys = ['weekdays', 'saturday', 'sunday']

export default function Contact() {
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <>
      <PageHeader
        crumb={t('public.contact.crumb')}
        eyebrow={t('public.contact.eyebrow')}
        title={t('public.contact.title')}
        subtitle={t('public.contact.subtitle')}
      />

      <section className="bg-white py-16 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {infoCardConfig.map((card) => (
              <a
                key={card.key}
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group rounded-2xl p-6 ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5 dark:ring-white/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-navy-900 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-navy-900 dark:text-white">{t(`public.contact.infoCards.${card.key}.title`)}</h3>
                <p className="mt-1 text-sm text-navy-700/60 dark:text-navy-100/60">{t(`public.contact.infoCards.${card.key}.line1`)}</p>
                <p className="mt-1 text-sm text-navy-700/60 dark:text-navy-100/60">{t(`public.contact.infoCards.${card.key}.line2`)}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-50/50 pb-24 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10 lg:col-span-3">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-navy-900 dark:text-white">
                    {t('public.contact.form.sentTitle')}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-navy-700/60 dark:text-navy-100/60">
                    {t('public.contact.form.sentDescription')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50 dark:text-white dark:ring-white/15 dark:hover:bg-white/5"
                  >
                    {t('public.contact.form.sendAnother')}
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">
                    {t('public.contact.form.heading')}
                  </h2>
                  <p className="mt-2 text-sm text-navy-700/60 dark:text-navy-100/60">
                    {t('public.contact.form.subheading')}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-navy-900 dark:text-white">
                          {t('public.contact.form.fullName')}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Jane Doe"
                          className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-navy-900 dark:text-white">
                          {t('auth.fields.email')}
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="jane@example.com"
                          className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('public.contact.form.subject')}</span>
                      <select
                        required
                        defaultValue=""
                        className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                      >
                        <option value="" disabled>
                          {t('public.contact.form.selectTopic')}
                        </option>
                        {subjectKeys.map((key) => (
                          <option key={key} value={key}>
                            {t(`public.contact.subjects.${key}`)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('public.contact.form.message')}</span>
                      <textarea
                        required
                        rows={5}
                        placeholder={t('public.contact.form.messagePlaceholder')}
                        className="mt-2 w-full resize-none rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-navy-100/35"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
                    >
                      {sending ? t('public.contact.form.sending') : t('public.contact.form.send')}
                      {!sending && <IconArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-white p-8 text-center ring-1 ring-navy-900/8 dark:bg-navy-900 dark:ring-white/10">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(10,20,64,0.9) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div className="relative flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-300">
                    <IconMapPin className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-navy-900 dark:text-white">{t('public.contact.office.title')}</h3>
                  <p className="mt-1 text-sm text-navy-700/60 dark:text-navy-100/60">
                    {t('public.contact.office.line1')}
                    <br />
                    {t('public.contact.office.line2')}
                  </p>
                  <a
                    href="https://www.openstreetmap.org/?mlat=-1.2667&mlon=36.8118#map=15/-1.2667/36.8118"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-navy-900 dark:hover:text-white"
                  >
                    {t('public.contact.office.getDirections')}
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="rounded-3xl bg-navy-900 p-7 text-white">
                <div className="flex items-center gap-2.5">
                  <IconClock className="h-5 w-5 text-brand-300" />
                  <h3 className="text-sm font-bold">{t('public.contact.officeHours.title')}</h3>
                </div>
                <dl className="mt-5 space-y-3">
                  {officeHourKeys.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b border-white/10 pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <dt className="text-navy-100/70">{t(`public.contact.officeHours.${key}.day`)}</dt>
                      <dd className="font-semibold">{t(`public.contact.officeHours.${key}.hours`)}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-3xl border border-dashed border-navy-900/15 p-6 text-sm text-navy-700/65 dark:border-white/15 dark:text-navy-100/65">
                {t('public.contact.faqPrompt')}{' '}
                <Link to="/#faq" className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white">
                  {t('public.contact.faqLink')}
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
