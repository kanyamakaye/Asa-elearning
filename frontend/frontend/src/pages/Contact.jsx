import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from '../components/icons'

const infoCards = [
  {
    icon: IconMail,
    title: 'Email Us',
    lines: ['support@asaacademy.com', 'We reply within 24 hours'],
    href: 'mailto:support@asaacademy.com',
  },
  {
    icon: IconPhone,
    title: 'Call Us',
    lines: ['+254 700 123 456', 'Mon–Fri, 8am–6pm EAT'],
    href: 'tel:+254700123456',
  },
  {
    icon: IconMapPin,
    title: 'Visit Us',
    lines: ['Westlands Business Park', 'Nairobi, Kenya'],
    href: 'https://www.openstreetmap.org/?mlat=-1.2667&mlon=36.8118#map=15/-1.2667/36.8118',
  },
]

const subjects = [
  'General Inquiry',
  'Course Support',
  'Technical Issue',
  'Partnership',
  'Instructor Application',
  'Billing & Payments',
]

const officeHours = [
  ['Monday – Friday', '8:00 AM – 6:00 PM'],
  ['Saturday', '9:00 AM – 2:00 PM'],
  ['Sunday', 'Closed'],
]

export default function Contact() {
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
        crumb="Contact"
        eyebrow="We're here to help"
        title="Get in touch with Asa Academy"
        subtitle="Questions about a course, a technical issue, or interested in teaching? Send us a message and our team will get back to you."
      />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {infoCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group rounded-2xl p-6 ring-1 ring-navy-900/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-navy-900 group-hover:text-white">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-navy-900">{card.title}</h3>
                {card.lines.map((line) => (
                  <p key={line} className="mt-1 text-sm text-navy-700/60">
                    {line}
                  </p>
                ))}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-50/50 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/8 lg:col-span-3">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-navy-900">
                    Message sent
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-navy-700/60">
                    Thanks for reaching out. Our team will get back to you within
                    24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 transition-colors hover:bg-navy-50"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold tracking-tight text-navy-900">
                    Send us a message
                  </h2>
                  <p className="mt-2 text-sm text-navy-700/60">
                    Fill out the form and we&apos;ll respond as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-navy-900">
                          Full name
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Jane Doe"
                          className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-navy-900">
                          Email address
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="jane@example.com"
                          className="mt-2 w-full rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-sm font-semibold text-navy-900">Subject</span>
                      <select
                        required
                        defaultValue=""
                        className="mt-2 w-full rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        {subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-navy-900">Message</span>
                      <textarea
                        required
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="mt-2 w-full resize-none rounded-xl border border-navy-900/10 px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
                    >
                      {sending ? 'Sending…' : 'Send Message'}
                      {!sending && <IconArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-white p-8 text-center ring-1 ring-navy-900/8">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(10,20,64,0.9) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div className="relative flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                    <IconMapPin className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-navy-900">Our Office</h3>
                  <p className="mt-1 text-sm text-navy-700/60">
                    Westlands Business Park
                    <br />
                    Nairobi, Kenya
                  </p>
                  <a
                    href="https://www.openstreetmap.org/?mlat=-1.2667&mlon=36.8118#map=15/-1.2667/36.8118"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-navy-900"
                  >
                    Get Directions
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="rounded-3xl bg-navy-900 p-7 text-white">
                <div className="flex items-center gap-2.5">
                  <IconClock className="h-5 w-5 text-brand-300" />
                  <h3 className="text-sm font-bold">Office Hours</h3>
                </div>
                <dl className="mt-5 space-y-3">
                  {officeHours.map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between border-b border-white/10 pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <dt className="text-navy-100/70">{day}</dt>
                      <dd className="font-semibold">{hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-3xl border border-dashed border-navy-900/15 p-6 text-sm text-navy-700/65">
                Looking for quick answers instead? Check our{' '}
                <Link to="/#faq" className="font-semibold text-brand-500 hover:text-navy-900">
                  frequently asked questions
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
