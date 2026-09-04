export default function Radio({ label, className = '', ...props }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 text-sm text-navy-800 ${className}`}>
      <input
        type="radio"
        className="h-4.5 w-4.5 border-navy-900/20 text-brand-500 focus:ring-2 focus:ring-brand-100"
        {...props}
      />
      {label}
    </label>
  )
}
