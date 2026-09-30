// Response bodies for list/history endpoints are untyped in OpenAPI ({}), so normalize defensively.
export const pickList = (d, keys) => {
  if (Array.isArray(d)) return d
  for (const k of keys) if (Array.isArray(d?.[k])) return d[k]
  return []
}
export const docId = (d) => d.document_id ?? d.id ?? d._id
export const convId = (c) => c.conversation_id ?? c.id ?? c._id
const TK = 'rag_titles'
export const loadTitles = () => { try { return JSON.parse(localStorage.getItem(TK) || '{}') } catch { return {} } }
export const saveTitle = (id, q) => {
  try { const t = loadTitles(); if (!t[id]) { t[id] = q.slice(0, 48); localStorage.setItem(TK, JSON.stringify(t)) } return t } catch { return {} }
}
// Server-provided title if any, else the first question saved locally, else a short id.
export const convLabel = (c, titles = {}) =>
  c.title ?? c.name ?? c.question ?? c.last_question ?? titles[convId(c)] ?? `Chat ${String(convId(c)).slice(0, 6)}`

export function normalizeHistory(d) {
  const list = pickList(d, ['messages', 'history', 'conversation'])
  const out = []
  for (const m of list) {
    if (m.role && (m.content ?? m.message) != null) {
      out.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content ?? m.message, sources: m.sources })
    } else {
      if (m.question != null) out.push({ role: 'user', content: m.question })
      if (m.answer != null) out.push({ role: 'assistant', content: m.answer, sources: m.sources })
    }
  }
  return out
}
