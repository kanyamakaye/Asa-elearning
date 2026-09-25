import { IconLoader } from './LoadingSpinner'

const variants = {
  primary: 'bg-navy-900 text-white shadow-sm shadow-navy-900/20 hover:bg-brand-500 hover:shadow-md hover:shadow-brand-500/30 dark:bg-brand-500 dark:hover:bg-brand-400',
  secondary: 'bg-navy-50 text-navy-800 hover:bg-navy-100 dark:bg-white/10 dark:text-navy-100 dark:hover:bg-white/15',
  outline: 'text-navy-800 ring-1 ring-navy-900/15 hover:bg-navy-50 dark:text-navy-100 dark:ring-white/20 dark:hover:bg-white/5',
  danger: 'bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 hover:shadow-md hover:shadow-red-600/30 dark:bg-red-500 dark:hover:bg-red-600',
  ghost: 'text-navy-700 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/5',
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
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <IconLoader className="h-4 w-4 animate-spin" />}
      {children}
    </Component>
  )
}
