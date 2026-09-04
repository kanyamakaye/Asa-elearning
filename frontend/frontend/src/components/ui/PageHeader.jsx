export default function PageHeader({ title, description, breadcrumb, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb}
        <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-700/55">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  )
}
