import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useChatStore } from '../store/chatStore'
import { Menu, Send, Sparkle, FileIcon } from '../components/Icons'

const Markdown = lazy(() => import('../components/Markdown'))
const SUGGESTIONS = ['Summarize my document', 'What are the key points?', 'Explain the main topic simply']

function Sources({ sources, scores }) {
  if (!sources?.length) return null
  const seen = new Set()
  const items = sources.map((s, i) => ({ s, score: scores?.[i] })).filter(({ s }) => { const k = typeof s === 'string' ? s : `${s.filename}|${s.page}`; if (seen.has(k)) return false; seen.add(k); return true })
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
      {items.map(({ s, score }, i) => (
        <span key={i} title={score != null ? `Relevance ${score.toFixed(2)}` : undefined} className="inline-flex max-w-full items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-700">
          <FileIcon size={12} className="shrink-0" />
          <span className="truncate">{typeof s === 'string' ? s : `${s.filename ?? 'source'}${s.page != null ? ` · p.${s.page}` : ''}`}</span>
        </span>
      ))}
    </div>
  )
}

function Message({ m }) {
  const user = m.role === 'user'
  return (
    <div className={`rise flex gap-2.5 ${user ? 'justify-end' : 'justify-start'}`}>
      {!user && <span className="bg-brand mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"><Sparkle size={15} /></span>}
      <div className={`max-w-[88%] px-4 py-2.5 text-[15px] sm:max-w-[80%] ${user ? 'bg-brand whitespace-pre-wrap break-words rounded-2xl rounded-br-md text-white shadow-md shadow-pink-200/50' : 'card rounded-tl-md'}`}>
        {user ? m.content : <div className="md break-words"><Suspense fallback={<p className="whitespace-pre-wrap">{m.content}</p>}><Markdown>{m.content}</Markdown></Suspense></div>}
        {!user && m.retrieval_relevant != null && (
          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${m.retrieval_relevant ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-500'}`}>
            {m.retrieval_relevant ? 'From your documents' : 'General answer'}
          </span>
        )}
        {!user && <Sources sources={m.sources} scores={m.reranker_scores} />}
      </div>
    </div>
  )
}

export default function Chat() {
  const { messages, sending, slow, loadingHistory, error, send } = useChatStore()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const end = useRef(); const ta = useRef()
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, sending])
  useEffect(() => { if (ta.current) { ta.current.style.height = 'auto'; ta.current.style.height = Math.min(ta.current.scrollHeight, 160) + 'px' } }, [text])

  const submit = (e) => { e?.preventDefault(); if (!text.trim() || sending) return; send(text); setText('') }
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e) }

  return (
    <div className="app-bg flex h-[100dvh] overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-30 transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>
      {open && <div className="fixed inset-0 z-20 bg-slate-900/25 backdrop-blur-[1px] md:hidden" onClick={() => setOpen(false)} />}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-pink-500 hover:bg-pink-50"><Menu /></button>
          <span className="text-brand font-extrabold">RAG Assistant</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-4 py-6">
            {loadingHistory && <p className="text-center text-sm text-sky-500">Loading conversation…</p>}
            {!loadingHistory && messages.length === 0 && (
              <div className="rise m-auto flex max-w-md flex-col items-center py-10 text-center">
                <span className="bg-brand mb-4 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg shadow-pink-200"><Sparkle size={26} /></span>
                <h2 className="text-2xl font-bold text-slate-800">How can I help?</h2>
                <p className="mt-1 text-sm text-slate-500">Upload a PDF from the sidebar, then ask about it.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="btn-ghost rounded-full text-[13px]">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Message key={i} m={m} />)}
            {sending && (
              <div className="flex items-center gap-2.5">
                <span className="bg-brand grid h-8 w-8 place-items-center rounded-full text-white"><Sparkle size={15} /></span>
                <div className="card flex items-center gap-1.5 rounded-tl-md px-4 py-3"><i className="dot" /><i className="dot" /><i className="dot" />{slow && <span className="ml-2 text-xs text-slate-500">Server is waking up — this can take up to a minute…</span>}</div>
              </div>
            )}
            {error && <p className="rise break-words rounded-xl bg-pink-50 p-3 text-sm text-pink-600">{error}</p>}
            <div ref={end} />
          </div>
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 bg-white/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4">
          <div className="card mx-auto flex max-w-3xl items-end gap-2 p-2 focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-100">
            <textarea ref={ta} rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} disabled={sending}
              placeholder="Ask a question…  (Enter to send, Shift+Enter for new line)"
              className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] outline-none placeholder:text-slate-400" />
            <button aria-label="Send" className="btn h-10 w-10 shrink-0 !rounded-xl !p-0" disabled={sending || !text.trim()}><Send size={17} /></button>
          </div>
        </form>
      </main>
    </div>
  )
}
