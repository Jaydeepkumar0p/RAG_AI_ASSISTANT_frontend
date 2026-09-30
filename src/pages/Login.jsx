import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const { login, loading, error, clearError } = useAuthStore()
  const [f, setF] = useState({ email: '', password: '' })
  const nav = useNavigate()
  const submit = async (e) => { e.preventDefault(); if (await login(f.email, f.password)) nav('/') }
  return (
    <AuthShell title="Sign in to continue">
      <form onSubmit={submit} className="space-y-3.5">
        <input className="input" type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="input" type="password" required placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {error && <p className="rounded-xl bg-pink-50 p-2.5 text-sm text-pink-600">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">No account? <Link onClick={clearError} className="font-semibold text-pink-500 hover:underline" to="/register">Register</Link></p>
    </AuthShell>
  )
}
