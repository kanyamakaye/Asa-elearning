import { faqs } from '../data/content'

export default function FAQ() {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 divide-y divide-navy-900/8 rounded-2xl ring-1 ring-navy-900/8">
          {faqs.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-navy-900 marker:content-none">
                {item.q}
                <span className="shrink-0 text-lg text-brand-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-700/70">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
