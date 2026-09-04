/**
 * Generic reusable table.
 *   columns: [{ key, label, render?(row) }]
 *   rows: array of objects
 */
export default function DataTable({ columns, rows, loading, emptyMessage = 'No records found.', rowKey = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-navy-900/8">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-navy-900/8 bg-navy-50/60">
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
                <td colSpan={columns.length} className="px-4 py-3">
                  <div className="h-4 w-full animate-pulse rounded bg-navy-50" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-navy-700/45">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-navy-50/40">
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
  )
}
