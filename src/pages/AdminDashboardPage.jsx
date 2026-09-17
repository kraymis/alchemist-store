import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })
  const token = window.localStorage.getItem('alchemist-admin-token')
  useEffect(() => {
    if (!token) return
    api('/admin/orders').then((data) => setOrders(data)).catch((error) => setState({ loading: false, error: error.message })).finally(() => setState((current) => ({ ...current, loading: false })))
  }, [token])
  if (!token) return <Navigate to="/admin/login" replace />
  const logout = () => { window.localStorage.removeItem('alchemist-admin-token'); window.localStorage.removeItem('alchemist-admin-user'); navigate('/admin/login') }
  return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">The Alchemist Store · Administration</p><h1>Commandes.</h1></div><button className="text-link" onClick={logout}>Déconnexion</button></header>{state.loading && <p className="admin-message">Chargement des commandes…</p>}{state.error && <p className="form-error" role="alert">{state.error}</p>}{!state.loading && !state.error && <div className="admin-orders">{orders.length ? orders.map((order) => <Link className="admin-order-row" to={`/admin/orders/${order.id}`} key={order.id}><div><strong>{order.customerName}</strong><span>{order.phone} · {new Date(order.createdAt).toLocaleString('fr-FR')}</span></div><span>{order.itemCount} article{order.itemCount > 1 ? 's' : ''}</span><strong>{order.total.toLocaleString('fr-FR')} DA</strong><b className={`status status-${order.status}`}>{order.status}</b></Link>) : <p className="admin-message">Aucune commande.</p>}</div>}</main>
}
