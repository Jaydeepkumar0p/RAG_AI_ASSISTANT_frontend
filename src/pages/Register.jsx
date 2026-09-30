import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AuthShell from '../components/AuthShell'

export default function Register() {
  const { register, loading, error, clearError } = useAuthStore()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const nav = useNavigate()
  const submit = async (e) => { e.preventDefault(); if (await register(f.name, f.email, f.password)) nav('/login') }
  return (
    <AuthShell title="Create your account">
      <form onSubmit={submit} className="space-y-3.5">
        <input className="input" required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="input" type="password" required placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {error && <p className="rounded-xl bg-pink-50 p-2.5 text-sm text-pink-600">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">Have an account? <Link onClick={clearError} className="font-semibold text-pink-500 hover:underline" to="/login">Sign in</Link></p>
    </AuthShell>
  )
}
