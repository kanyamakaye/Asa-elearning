export default function Textarea({ error, className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/35 focus:outline-none focus:ring-2 ${
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
          : 'border-navy-900/10 focus:border-brand-400 focus:ring-brand-100'
      } ${className}`}
      {...props}
    />
  )
}
