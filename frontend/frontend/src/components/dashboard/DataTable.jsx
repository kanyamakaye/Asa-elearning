/**
 * Generic reusable table with row numbering and page-number pagination.
 *   columns: [{ key, label, render?(row) }]
 *   rows: array of objects (a single page's worth)
 *   page, pageSize, total: pass all three (with onPageChange) to enable pagination
 */
export default function DataTable({
  columns,
  rows,
  loading,
  emptyMessage = 'No records found.',
  rowKey = 'id',
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
}) {
  const paginated = total != null && typeof onPageChange === 'function'
  const totalPages = paginated ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const startIndex = (page - 1) * pageSize

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-navy-900/8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/8 bg-navy-50/60">
              <th className="w-12 whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-700/55">#</th>
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-navy-700/55">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length + 1} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-navy-50" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-navy-700/45">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row[rowKey]} className="hover:bg-navy-50/40">
                  <td className="whitespace-nowrap px-4 py-3 text-navy-700/45">{startIndex + i + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-navy-800">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-900/8 bg-navy-50/40 px-4 py-3">
          <p className="text-xs text-navy-700/55">
            Showing {rows.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + rows.length, total)} of {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs font-semibold text-navy-700/70">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
