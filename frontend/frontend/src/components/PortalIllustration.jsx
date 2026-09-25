// Inline SVG (like HeroIllustration) — a student tapping a PIN into a phone
// that shows a lock shield, surrounded by soft hexagons. Flat geometry in the
// site's navy/brand palette so it sits well in both light and dark themes.
const hexagon = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function PortalIllustration({ className = '', label }) {
  return (
    <svg viewBox="0 0 420 400" className={className} role="img" aria-label={label}>
      {/* Floor shadow */}
      <ellipse cx="220" cy="372" rx="170" ry="16" className="fill-brand-300/40" />

      {/* Hexagons */}
      <polygon points={hexagon(112, 150, 30)} className="fill-brand-300/70" />
      <polygon points={hexagon(160, 112, 24)} className="fill-brand-400/70" />
      <polygon points={hexagon(92, 212, 26)} className="fill-brand-300/50" />
      <polygon points={hexagon(360, 190, 32)} className="fill-brand-300/60" />
      <polygon points={hexagon(372, 262, 22)} className="fill-brand-400/50" />

      {/* Phone body */}
      <rect x="178" y="40" width="168" height="320" rx="26" transform="rotate(4 262 200)" className="fill-navy-800" />
      <rect x="188" y="52" width="148" height="296" rx="18" transform="rotate(4 262 200)" className="fill-brand-50" />
      <rect x="236" y="56" width="52" height="8" rx="4" transform="rotate(4 262 200)" className="fill-navy-800" />

      <g transform="rotate(4 262 200)">
        {/* Shield + lock */}
        <path d="M262 84l32 12v22c0 22-14 36-32 44-18-8-32-22-32-44V96Z" className="fill-brand-600" />
        <rect x="250" y="112" width="24" height="20" rx="4" className="fill-white" />
        <path d="M254 112v-6a8 8 0 0 1 16 0v6" fill="none" strokeWidth="4" className="stroke-white" />
        <circle cx="262" cy="121" r="3" className="fill-brand-600" />

        {/* PIN dots */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={214 + i * 26} y="176" width="20" height="24" rx="5" className="fill-white stroke-brand-300" strokeWidth="1.5" />
            <circle cx={224 + i * 26} cy="188" r="4" className="fill-brand-600" />
          </g>
        ))}

        {/* Keypad */}
        {keys.map((k, i) => {
          const cx = 228 + (i % 3) * 34
          const cy = 226 + Math.floor(i / 3) * 30
          return (
            <g key={k}>
              <circle cx={cx} cy={cy} r="12" className="fill-brand-100" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" className="fill-navy-800">{k}</text>
            </g>
          )
        })}
        <circle cx="262" cy="316" r="12" className="fill-brand-100" />
        <text x="262" y="320" textAnchor="middle" fontSize="11" className="fill-navy-800">0</text>
        <circle cx="296" cy="316" r="12" className="fill-brand-600" />
        <path d="M291 316h10m-4-4-4 4 4 4" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-white" />
      </g>

      {/* Student — legs */}
      <rect x="128" y="250" width="20" height="112" rx="9" className="fill-navy-900" />
      <rect x="152" y="250" width="20" height="112" rx="9" className="fill-navy-800" />
      <ellipse cx="136" cy="364" rx="16" ry="6" className="fill-navy-950" />
      <ellipse cx="166" cy="364" rx="16" ry="6" className="fill-navy-950" />

      {/* Torso */}
      <path d="M120 170c0-16 12-28 28-28h8c16 0 28 12 28 28v92h-64Z" className="fill-brand-500" />

      {/* Arm reaching to the keypad */}
      <path d="M176 164c14 10 26 26 38 42" fill="none" strokeWidth="18" strokeLinecap="round" className="stroke-brand-600" />
      <circle cx="216" cy="208" r="9" className="fill-amber-800" />

      {/* Head */}
      <rect x="146" y="126" width="14" height="18" rx="6" className="fill-amber-800" />
      <circle cx="154" cy="110" r="22" className="fill-amber-800" />
      <path d="M132 106c0-16 12-24 24-24s22 8 20 22c-6-6-14-8-22-6-8 2-14 4-22 8Z" className="fill-navy-950" />

      {/* Plant */}
      <path d="M392 320c-10-24-4-46 12-58 4 22 0 42-12 58Z" className="fill-sky-400" />
      <path d="M392 320c-14-16-18-36-8-52 12 16 14 36 8 52Z" className="fill-sky-500" />
      <path d="M376 320h32l-4 30a10 10 0 0 1-10 8h-4a10 10 0 0 1-10-8Z" className="fill-amber-400" />
    </svg>
  )
}
