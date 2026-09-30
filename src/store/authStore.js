import { create } from 'zustand'
import { authApi, userApi, TOKEN_KEY, errMsg } from '../api/client'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  ready: false, // true once initial token validation finished
  error: null,
  loading: false,

  async init() {
    if (!get().token) return set({ ready: true })
    try { set({ user: await userApi.me(), ready: true }) }
    catch { get().logout(); set({ ready: true }) }
  },
  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const { access_token } = await authApi.login(email, password)
      localStorage.setItem(TOKEN_KEY, access_token)
      set({ token: access_token })
      set({ user: await userApi.me() })
      return true
    } catch (e) { set({ error: errMsg(e) }); localStorage.removeItem(TOKEN_KEY); set({ token: null }); return false }
    finally { set({ loading: false }) }
  },
  async register(name, email, password) {
    set({ loading: true, error: null })
    try { await authApi.register(name, email, password); return true }
    catch (e) { set({ error: errMsg(e) }); return false }
    finally { set({ loading: false }) }
  },
  logout() { localStorage.removeItem(TOKEN_KEY); set({ token: null, user: null }) }, // client-side only; no logout endpoint
  clearError: () => set({ error: null }),
}))
