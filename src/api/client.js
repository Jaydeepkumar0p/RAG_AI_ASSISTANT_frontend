import axios from 'axios'

export const TOKEN_KEY = 'rag_token'
const BASE = import.meta.env.VITE_API_URL 

// Long timeout: Render free instances can cold-start slowly.
const http = axios.create({ baseURL: BASE, timeout: 120000 })

http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(TOKEN_KEY)
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  }
)

// FastAPI errors: {detail: "string"} or {detail: [{loc,msg,type}]} (422)
export function errMsg(e) {
  if (e.code === 'ECONNABORTED') return 'Request timed out. The server may be waking up — try again.'
  if (!e.response) return 'Network error. Check your connection.'
  const st = e.response.status
  const d = e.response.data?.detail
  if (typeof d === 'string') return `${d} (HTTP ${st})`
  if (Array.isArray(d)) return d.map((x) => `${(x.loc || []).slice(1).join('.') || 'field'}: ${x.msg}`).join('; ')
  const raw = typeof e.response.data === 'string' ? e.response.data.slice(0, 120) : ''
  return `Request failed (HTTP ${st})${raw ? ': ' + raw : ''}`
}

export const authApi = {
  register: (name, email, password) => http.post('/auth/register', { name, email, password }).then((r) => r.data),
  login: (email, password) => http.post('/auth/login', { email, password }).then((r) => r.data), // {access_token, token_type}
}
export const userApi = { me: () => http.get('/users/me').then((r) => r.data) }
export const documentApi = {
  list: () => http.get('/documents').then((r) => r.data),
  get: (id) => http.get(`/documents/${encodeURIComponent(id)}`).then((r) => r.data),
  remove: (id) => {
    if (!id) return Promise.reject(new Error('Missing document id'))
    return http.delete(`/documents/${encodeURIComponent(id)}`).then((r) => r.data)
  },
  upload: (file, onProgress) => {
    const fd = new FormData()
    fd.append('file', file) // field name per OpenAPI: "file"
    return http
      .post('/documents/upload', fd, {
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data)
  },
}
export const conversationApi = {
  list: () => http.get('/conversations').then((r) => r.data),
  get: (id) => http.get(`/conversations/${encodeURIComponent(id)}`).then((r) => r.data),
  remove: (id) => http.delete(`/conversations/${encodeURIComponent(id)}`).then((r) => r.data),
}
export const chatApi = {
  // question & conversation_id are QUERY params; no request body (per OpenAPI)
  ask: (question, conversation_id) =>
    http.post('/chat', null, { params: { question, ...(conversation_id ? { conversation_id } : {}) } }).then((r) => r.data),
}
export const healthApi = {
  root: () => http.get('/').then((r) => r.data),
  db: () => http.get('/health/db').then((r) => r.data),
  qdrant: () => http.get('/health/qdrant').then((r) => r.data),
}
