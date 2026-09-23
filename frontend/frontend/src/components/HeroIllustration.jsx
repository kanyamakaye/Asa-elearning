// Custom hand-drawn illustration (not a stock image) — a person learning at
// a laptop, in the site's own navy/brand/violet palette. Kept as flat,
// simple geometry rather than a detailed character so it reads as
// intentional and premium rather than clip-art (see homedoc.md's warning
// against "cheap-looking illustrations"), and as inline SVG rather than a
// hot-linked image so it can never fail to load or show blank (the exact
// problem the course/instructor photos elsewhere on the homepage had).
export default function HeroIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 400 380" className={className} role="img" aria-label="Illustration of a student learning at a laptop">
      {/* Soft backdrop */}
      <ellipse cx="200" cy="196" rx="184" ry="164" className="fill-brand-50" />

      {/* Decorative sparks */}
      <circle cx="76" cy="70" r="6" className="fill-violet-300/70" />
      <circle cx="336" cy="120" r="5" className="fill-brand-300/70" />
      <circle cx="60" cy="230" r="4" className="fill-brand-300/60" />

      {/* Plant */}
      <path d="M96 268c-6-18-2-34 10-44 4 16 2 32-10 44Z" className="fill-emerald-400" />
      <path d="M96 268c8-14 8-30 0-42-10 14-10 30 0 42Z" className="fill-emerald-500" />
      <path d="M84 270h28l-4 22a10 10 0 0 1-10 8h-0a10 10 0 0 1-10-8Z" className="fill-amber-500" />

      {/* Desk */}
      <rect x="52" y="272" width="296" height="16" rx="8" className="fill-navy-900/10" />
      <rect x="52" y="266" width="296" height="10" rx="5" className="fill-navy-800" />

      {/* Chair back */}
      <rect x="156" y="120" width="96" height="150" rx="26" className="fill-navy-100" />

      {/* Torso / hoodie */}
      <path d="M146 268v-46c0-30 24-54 54-54s54 24 54 54v46Z" className="fill-brand-500" />
      <path d="M188 178c4 10 20 10 24 0" className="fill-none stroke-brand-300" strokeWidth="4" strokeLinecap="round" />

      {/* Arms reaching to laptop */}
      <path d="M156 232c-10 8-16 18-16 30" className="fill-none stroke-brand-500" strokeWidth="18" strokeLinecap="round" />
      <path d="M244 232c10 8 16 18 16 30" className="fill-none stroke-brand-500" strokeWidth="18" strokeLinecap="round" />
      <circle cx="140" cy="266" r="10" className="fill-[#f2c199]" />
      <circle cx="260" cy="266" r="10" className="fill-[#f2c199]" />

      {/* Head */}
      <circle cx="200" cy="146" r="40" className="fill-[#f2c199]" />
      <path d="M160 138c0-24 18-42 40-42s40 18 40 42c-10-8-24-4-40-4s-30-4-40 4Z" className="fill-navy-900" />
      <circle cx="188" cy="148" r="3" className="fill-navy-900" />
      <circle cx="212" cy="148" r="3" className="fill-navy-900" />
      <path d="M190 160c4 5 16 5 20 0" className="fill-none stroke-navy-900" strokeWidth="3" strokeLinecap="round" />

      {/* Laptop on desk */}
      <path d="M170 262v-40a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v40Z" className="fill-navy-900" />
      <rect x="178" y="226" width="44" height="28" rx="3" className="fill-brand-100" />
      <rect x="184" y="234" width="26" height="3" rx="1.5" className="fill-brand-400" />
      <rect x="184" y="241" width="18" height="3" rx="1.5" className="fill-brand-300" />
      <path d="M162 262h76l6 10a4 4 0 0 1-4 6h-80a4 4 0 0 1-4-6Z" className="fill-navy-800" />

      {/* Floating idea bulb */}
      <g transform="translate(292 66)">
        <circle r="20" className="fill-amber-300" />
        <path d="M0-30v10M21-21l-7 7M-21-21l7 7" className="stroke-amber-300" strokeWidth="4" strokeLinecap="round" />
        <rect x="-6" y="14" width="12" height="8" rx="2" className="fill-navy-700" />
      </g>
    </svg>
  )
}
