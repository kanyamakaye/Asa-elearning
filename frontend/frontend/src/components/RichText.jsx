// Tiny markdown-lite renderer for lesson content generated on the backend
// (## headings, "- " bullet lists, **bold** spans, blank-line paragraphs).
// Deliberately not a full markdown parser — just enough structure to make
// generated lesson content read like a real article instead of a text dump.

function renderInline(text, keyPrefix) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{part}</strong> : <span key={`${keyPrefix}-${i}`}>{part}</span>
  )
}

export default function RichText({ text, className = '' }) {
  if (!text) return null

  const lines = text.split('\n')
  const blocks = []
  let listItems = null

  function flushList() {
    if (listItems) {
      blocks.push({ type: 'ul', items: listItems })
      listItems = null
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h3', text: trimmed.slice(3) })
    } else if (trimmed.startsWith('- ')) {
      listItems = listItems ?? []
      listItems.push(trimmed.slice(2))
    } else {
      flushList()
      blocks.push({ type: 'p', text: trimmed })
    }
  })
  flushList()

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === 'h3') {
          return (
            <h3 key={i} className="text-base font-bold text-navy-900">
              {renderInline(block.text, i)}
            </h3>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-navy-700/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500/70" />
                  <span>{renderInline(item, `${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-navy-700/80">
            {renderInline(block.text, i)}
          </p>
        )
      })}
    </div>
  )
}
