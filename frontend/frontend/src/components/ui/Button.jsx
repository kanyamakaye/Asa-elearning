import { IconLoader } from './LoadingSpinner'

const variants = {
  primary: 'bg-navy-900 text-white hover:bg-brand-500',
  secondary: 'bg-navy-50 text-navy-800 hover:bg-navy-100',
  outline: 'text-navy-800 ring-1 ring-navy-900/15 hover:bg-navy-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-navy-700 hover:bg-navy-50',
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <IconLoader className="h-4 w-4 animate-spin" />}
      {children}
    </Component>
  )
}
