import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (window.localStorage.getItem('alchemist-admin-token')) return <Navigate to="/admin/dashboard" replace />
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api('/admin/login', { method: 'POST', body: JSON.stringify(form) })
      window.localStorage.setItem('alchemist-admin-token', result.token)
      window.localStorage.setItem('alchemist-admin-user', JSON.stringify(result.admin))
      navigate('/admin/dashboard')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }
  return <main className="admin-shell"><form className="admin-auth" onSubmit={submit}><p className="eyebrow">The Alchemist Store · Administration</p><h1>Connexion.</h1>{error && <p className="form-error" role="alert">{error}</p>}<label>Nom d&apos;utilisateur<input required value={form.username} onChange={update('username')} autoComplete="username" /></label><label>Mot de passe<input required type="password" value={form.password} onChange={update('password')} autoComplete="current-password" /></label><button className="button button-dark" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button></form></main>
}
