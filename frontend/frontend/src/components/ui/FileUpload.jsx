import { useRef, useState } from 'react'
import { IconClose } from '../icons'

/** Lightweight file picker with client-side type/size validation.
 * `accept` is a comma-separated MIME/extension list; `maxSizeMb` is enforced before onChange fires. */
export default function FileUpload({
  label,
  accept,
  maxSizeMb = 10,
  value,
  onChange,
  error,
  hint,
}) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File must be smaller than ${maxSizeMb}MB.`)
      e.target.value = ''
      return
    }
    setLocalError('')
    onChange(file)
  }

  function clear() {
    setLocalError('')
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = error || localError

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-sm ${
          displayError
            ? 'border-red-300 bg-red-50/40 dark:border-red-400/40 dark:bg-red-500/10'
            : 'border-navy-900/15 bg-navy-50/40 dark:border-white/15 dark:bg-white/5'
        }`}
      >
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-brand-500 hover:text-navy-900 dark:hover:text-white"
          >
            {label || 'Choose file'}
          </button>
          <p className="mt-0.5 truncate text-xs text-navy-700/50 dark:text-navy-100/50">
            {value ? (typeof value === 'string' ? value.split('/').pop() : value.name) : hint || 'No file selected'}
          </p>
        </div>
        {value && (
          <button type="button" onClick={clear} aria-label="Remove file" className="shrink-0 text-navy-700/40 hover:text-red-600 dark:text-navy-100/40 dark:hover:text-red-400">
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      {displayError && <p className="mt-1.5 text-xs font-medium text-red-600">{displayError}</p>}
    </div>
  )
}
