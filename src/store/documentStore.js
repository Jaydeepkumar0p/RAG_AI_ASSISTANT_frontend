import { create } from 'zustand'
import { documentApi, errMsg } from '../api/client'
import { pickList, docId } from '../api/normalize'

export const useDocumentStore = create((set, get) => ({
  documents: [], deleting: {}, loading: false, uploading: false, progress: 0, error: null, notice: null,
  async fetch() {
    set({ loading: true, error: null })
    try { set({ documents: pickList(await documentApi.list(), ['documents', 'items', 'data']) }) }
    catch (e) { set({ error: errMsg(e) }) }
    finally { set({ loading: false }) }
  },
  async upload(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) return set({ error: 'Only PDF files are supported.' })
    set({ uploading: true, progress: 0, error: null, notice: null })
    try {
      const r = await documentApi.upload(file, (p) => set({ progress: p }))
      set({ notice: r?.message ? `${r.message}${r.chunks != null ? ` (${r.chunks} chunks)` : ''}` : 'Uploaded' })
      await get().fetch()
    } catch (e) { set({ error: errMsg(e) }) }
    finally { set({ uploading: false }) }
  },
  async remove(doc) {
    const id = docId(doc)
    if (!id) return set({ error: 'Cannot delete: document has no id field.' })
    if (get().deleting[id]) return
    set({ deleting: { ...get().deleting, [id]: true }, error: null })
    try {
      await documentApi.remove(id)
      set({ notice: 'Document deleted' })
    } catch (e) {
      console.error('Delete failed', e.response?.status, e.response?.data)
      // 404 => already gone on the server; anything else is a real failure
      if (e.response?.status !== 404) set({ error: e.response ? errMsg(e) : e.message || errMsg(e) })
    } finally {
      const { [id]: _, ...rest } = get().deleting
      set({ deleting: rest })
      await get().fetch() // always resync with server truth
    }
  },
  dismiss: () => set({ error: null, notice: null }),
  reset: () => set({ documents: [], error: null, notice: null }),
}))
