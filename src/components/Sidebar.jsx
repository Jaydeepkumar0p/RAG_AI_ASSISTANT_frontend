import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { useDocumentStore } from '../store/documentStore'
import { convId, convLabel, docId } from '../api/normalize'
import { healthApi } from '../api/client'
import { Plus, Trash, FileIcon, Upload, Logout, Chat, Close } from './Icons'

function Health() {
  const [s, setS] = useState({})
  const check = () => {
    const run = (k, fn) => fn().then(() => setS((p) => ({ ...p, [k]: true }))).catch(() => setS((p) => ({ ...p, [k]: false })))
    run('api', healthApi.root); run('db', healthApi.db); run('qdrant', healthApi.qdrant)
  }
  useEffect(check, [])
  const dot = (v) => (v === undefined ? 'bg-slate-300' : v ? 'bg-emerald-400' : 'bg-pink-500')
  return (
    <button onClick={check} title="Re-check services" className="flex items-center gap-3 text-[11px] text-slate-500">
      {['api', 'db', 'qdrant'].map((k) => (
        <span key={k} className="flex items-center gap-1"><i className={`h-2 w-2 rounded-full ${dot(s[k])}`} />{k}</span>
      ))}
    </button>
  )
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore()
  const chat = useChatStore()
  const docs = useDocumentStore()
  const fileRef = useRef()

  useEffect(() => { chat.fetchConversations(); docs.fetch() }, [])
  const onLogout = () => { logout(); chat.reset(); docs.reset() }
  const name = user?.name ?? user?.email ?? 'You'

  return (
    <aside className="flex h-full w-[86vw] max-w-xs flex-col border-r border-slate-100 bg-white/95 backdrop-blur md:w-80 md:max-w-none">
      <div className="flex items-center justify-between p-4 pb-3">
        <span className="text-brand text-lg font-extrabold">RAG Assistant</span>
        <button aria-label="Close menu" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 md:hidden" onClick={onClose}><Close /></button>
      </div>
      <div className="px-4 pb-3">
        <button className="btn w-full" onClick={() => { chat.newChat(); onClose?.() }}><Plus size={16} /> New chat</button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
        <section>
          <h2 className="label">Conversations</h2>
          <ul className="space-y-1">
            {chat.conversations.length === 0 && <li className="px-2 text-xs text-slate-400">No conversations yet</li>}
            {chat.conversations.map((c) => {
              const id = convId(c)
              const active = chat.activeId === id
              return (
                <li key={id} className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition ${active ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-100' : 'text-slate-600 hover:bg-sky-50'}`}>
                  <Chat size={15} className="shrink-0 opacity-60" />
                  <button className="min-w-0 flex-1 truncate text-left" onClick={() => { chat.open(id); onClose?.() }}>{convLabel(c, chat.titles)}</button>
                  <button aria-label="Delete conversation" className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-pink-600 md:opacity-0 md:group-hover:opacity-100" onClick={() => confirm('Delete this conversation?') && chat.remove(id)}><Trash size={14} /></button>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h2 className="label">Documents</h2>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { const f = e.target.files[0]; if (f) docs.upload(f); e.target.value = '' }} />
          <button className="btn-ghost w-full border-dashed" disabled={docs.uploading} onClick={() => fileRef.current.click()}>
            <Upload size={16} /> {docs.uploading ? `Uploading… ${docs.progress}%` : 'Upload PDF'}
          </button>
          {docs.uploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100">
              <div className="bg-brand h-full transition-all" style={{ width: `${docs.progress}%` }} />
            </div>
          )}
          {docs.uploading && docs.progress >= 100 && <p className="mt-1 px-1 text-xs text-sky-600">Processing document…</p>}
          {docs.error && <p onClick={docs.dismiss} className="mt-2 cursor-pointer break-words rounded-xl bg-pink-50 p-2.5 text-xs text-pink-600">{docs.error}</p>}
          {docs.notice && <p onClick={docs.dismiss} className="mt-2 cursor-pointer rounded-xl bg-sky-50 p-2.5 text-xs text-sky-700">{docs.notice}</p>}
          <ul className="mt-2 space-y-1.5">
            {docs.loading && <li className="px-2 text-xs text-slate-400">Loading…</li>}
            {!docs.loading && docs.documents.length === 0 && <li className="px-2 text-xs text-slate-400">No documents yet</li>}
            {docs.documents.map((d) => (
              <li key={docId(d)} className="card flex items-center gap-2 px-2.5 py-2 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-pink-50 text-pink-500"><FileIcon size={15} /></span>
                <span className="min-w-0 flex-1 truncate text-slate-700" title={d.filename}>{d.filename ?? docId(d)}</span>
                <button aria-label="Delete document" disabled={!!docs.deleting[docId(d)]} className="rounded-md p-1 text-slate-400 hover:bg-pink-50 hover:text-pink-600 disabled:opacity-40" onClick={() => confirm('Delete this document?') && docs.remove(d)}>
                  {docs.deleting[docId(d)] ? '…' : <Trash size={15} />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-3 border-t border-slate-100 p-3">
        <Health />
        <div className="flex items-center gap-2">
          <span className="bg-brand grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white">{name[0]?.toUpperCase()}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{name}</span>
          <button aria-label="Logout" title="Logout" className="rounded-lg p-2 text-slate-400 hover:bg-pink-50 hover:text-pink-600" onClick={onLogout}><Logout size={16} /></button>
        </div>
      </div>
    </aside>
  )
}
