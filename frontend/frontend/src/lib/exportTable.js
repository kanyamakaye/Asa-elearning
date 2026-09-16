import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

/** Turns a DataTable `columns` config into plain-text rows for export.
 * Columns render JSX for display (badges, links, icons), which can't be
 * stringified safely — so a column can define `exportValue(row)` for the
 * text version; falling back to the raw field value covers most columns
 * (title, email, status strings, ...) without extra work at each call site. */
function toExportRows(rows, columns) {
  return rows.map((row) =>
    columns.map((col) => {
      const value = col.exportValue ? col.exportValue(row) : row[col.key]
      return value === null || value === undefined ? '' : String(value)
    })
  )
}

export function exportTableToExcel(rows, columns, filename) {
  const header = columns.map((c) => c.label)
  const body = toExportRows(rows, columns)
  const sheet = XLSX.utils.aoa_to_sheet([header, ...body])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Data')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function exportTableToPdf(rows, columns, filename, title) {
  const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' })
  if (title) doc.text(title, 14, 14)
  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: toExportRows(rows, columns),
    startY: title ? 20 : 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [10, 20, 64] },
  })
  doc.save(`${filename}.pdf`)
}
