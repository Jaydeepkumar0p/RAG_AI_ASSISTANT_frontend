import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useChatStore } from './store/chatStore'
import { useDocumentStore } from './store/documentStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'

function Protected({ children }) {
  const { token, ready } = useAuthStore()
  if (!ready) return <div className="grid h-[100dvh] place-items-center text-sky-500">Loading…</div>
  return token ? children : <Navigate to="/login" replace />
}
function Guest({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/" replace /> : children
}

export default function App() {
  const navigate = useNavigate()
  useEffect(() => {
    useAuthStore.getState().init()
    const onExpired = () => {
      useAuthStore.setState({ token: null, user: null })
      useChatStore.getState().reset(); useDocumentStore.getState().reset()
      navigate('/login')
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [navigate])

  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route path="/register" element={<Guest><Register /></Guest>} />
      <Route path="/" element={<Protected><Chat /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
