import { useState } from 'react'
import { exportTableToExcel, exportTableToPdf } from '../../lib/exportTable'
import { IconArrowDown, IconChevronDown, IconSearch } from '../icons'

function ExportMenu({ rows, columns, filename, title }) {
  const [open, setOpen] = useState(false)
  if (!filename) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-navy-700 ring-1 ring-navy-900/10 hover:bg-navy-50"
      >
        <IconArrowDown className="h-3.5 w-3.5" /> Export
        <IconChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-navy-900/10">
          <button
            type="button"
            onClick={() => exportTableToExcel(rows, columns, filename)}
            className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-navy-800 hover:bg-navy-50"
          >
            Export as Excel
          </button>
          <button
            type="button"
            onClick={() => exportTableToPdf(rows, columns, filename, title)}
            className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-navy-800 hover:bg-navy-50"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Generic reusable table with row numbering, page-number pagination, and an
 * optional toolbar (search box, filter dropdowns, Excel/PDF export).
 *   columns: [{ key, label, render?(row), exportValue?(row) }]
 *   rows: array of objects (a single page's worth, or the full filtered set
 *     if the caller doesn't paginate server-side)
 *   page, pageSize, total: pass all three (with onPageChange) to enable pagination
 *   search: { value, onChange, placeholder? } — renders a search input
 *   filters: [{ label, value, onChange, options: [{ value, label }] }]
 *   exportRows: the rows to export — defaults to `rows`; pass the full
 *     filtered/unpaginated array here if `rows` is just the current page,
 *     so export covers everything currently filtered/searched, not just
 *     what's on screen.
 *   exportFilename: enables the Export button when set (e.g. "users")
 *   exportTitle: optional heading printed at the top of the PDF
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
  search,
  filters,
  exportRows,
  exportFilename,
  exportTitle,
}) {
  const paginated = total != null && typeof onPageChange === 'function'
  const totalPages = paginated ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const startIndex = (page - 1) * pageSize
  const hasToolbar = Boolean(search || (filters && filters.length > 0) || exportFilename)

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-navy-900/8">
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2.5 border-b border-navy-900/8 bg-white px-4 py-3">
          {search && (
            <div className="relative min-w-[200px] flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-700/35" />
              <input
                type="text"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? 'Search…'}
                className="w-full rounded-lg border border-navy-900/10 py-2 pl-8 pr-3 text-xs text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}
          {(filters ?? []).map((f) => (
            <select
              key={f.label}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="rounded-lg border border-navy-900/10 py-2 pl-2.5 pr-7 text-xs font-medium text-navy-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          <div className="ml-auto">
            <ExportMenu rows={exportRows ?? rows} columns={columns} filename={exportFilename} title={exportTitle} />
          </div>
        </div>
      )}

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
