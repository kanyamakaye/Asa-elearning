import { useSearchParams } from 'react-router-dom'
import { IconClock } from '../../components/icons'

export default function ComingSoon() {
  const [params] = useSearchParams()
  const label = params.get('label') || 'This feature'

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 text-center ring-1 ring-navy-900/8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700/50">
        <IconClock className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-navy-900">{label}</h2>
      <p className="mt-2 max-w-sm text-sm text-navy-700/55">
        This section is on the roadmap and isn't built yet. Check back soon.
      </p>
    </div>
  )
}
