import { create } from 'zustand'
import { chatApi, conversationApi, errMsg } from '../api/client'
import { pickList, convId, normalizeHistory, loadTitles, saveTitle } from '../api/normalize'

export const useChatStore = create((set, get) => ({
  conversations: [], activeId: null, messages: [], titles: loadTitles(),
  sending: false, slow: false, loadingHistory: false, error: null,

  async fetchConversations() {
    try { set({ conversations: pickList(await conversationApi.list(), ['conversations', 'items', 'data']) }) }
    catch (e) { set({ error: errMsg(e) }) }
  },
  newChat: () => set({ activeId: null, messages: [], error: null }),
  async open(id) {
    set({ activeId: id, messages: [], loadingHistory: true, error: null })
    try {
      const messages = normalizeHistory(await conversationApi.get(id))
      const first = messages.find((m) => m.role === 'user')
      set({ messages, ...(first ? { titles: saveTitle(id, first.content) } : {}) })
    } catch (e) { set({ error: errMsg(e) }) }
    finally { set({ loadingHistory: false }) }
  },
  async remove(id) {
    try {
      await conversationApi.remove(id)
      set({ conversations: get().conversations.filter((c) => convId(c) !== id) })
      if (get().activeId === id) get().newChat()
    } catch (e) { set({ error: errMsg(e) }) }
  },
  async send(question) {
    const q = question.trim()
    if (!q || get().sending) return
    set({ messages: [...get().messages, { role: 'user', content: q }], sending: true, error: null })
    const timer = setTimeout(() => set({ slow: true }), 8000)
    try {
      const r = await chatApi.ask(q, get().activeId) // conversation_id kept for follow-ups
      const isNew = !get().activeId
      const id = r.conversation_id ?? get().activeId
      set({
        activeId: id,
        titles: id ? saveTitle(id, q) : get().titles,
        messages: [...get().messages, {
          role: 'assistant', content: r.answer ?? '', sources: r.sources ?? [], reranker_scores: r.reranker_scores,
          intent: r.intent, rewritten_query: r.rewritten_query, retrieval_relevant: r.retrieval_relevant,
        }],
      })
      if (isNew) get().fetchConversations()
    } catch (e) { set({ error: errMsg(e) }) }
    finally { clearTimeout(timer); set({ sending: false, slow: false }) }
  },
  reset: () => set({ conversations: [], activeId: null, messages: [], error: null }),
}))
