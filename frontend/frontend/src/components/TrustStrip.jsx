const brands = [
  'Nexora',
  'Vantify',
  'Corebridge',
  'Skylark Group',
  'Meridian Co.',
  'Northfield Inc.',
]

export default function TrustStrip() {
  return (
    <section className="border-b border-navy-900/8 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-navy-700/45">
          Trusted by teams and learners from
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg font-extrabold tracking-tight text-navy-900/25"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
