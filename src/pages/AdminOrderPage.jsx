import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api, assetUrl } from '../lib/api'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export function AdminOrderPage() {
  const { id } = useParams()
  const token = window.localStorage.getItem('alchemist-admin-token')
  const [order, setOrder] = useState(null)
  const [state, setState] = useState({ loading: true, error: '', saving: false })
  useEffect(() => {
    if (!token) return
    api(`/admin/orders/${id}`).then(setOrder).catch((error) => setState({ loading: false, error: error.message, saving: false })).finally(() => setState((current) => ({ ...current, loading: false })))
  }, [id, token])
  if (!token) return <Navigate to="/admin/login" replace />
  if (state.loading) return <main className="admin-shell"><p className="admin-message">Chargement de la commande…</p></main>
  if (state.error) return <main className="admin-shell"><p className="form-error" role="alert">{state.error}</p><Link to="/admin/dashboard">Retour</Link></main>
  const updateStatus = async (event) => {
    setState((current) => ({ ...current, saving: true }))
    try { setOrder(await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: event.target.value }) })) } catch (error) { setState((current) => ({ ...current, error: error.message })) } finally { setState((current) => ({ ...current, saving: false })) }
  }
  return <main className="admin-shell"><header className="admin-header"><div><Link className="text-link" to="/admin/dashboard">← Commandes</Link><p className="eyebrow">Détail de commande</p><h1>#{order.id.slice(-8)}</h1></div><select value={order.status} onChange={updateStatus} disabled={state.saving}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></header><div className="admin-detail-grid"><section className="admin-panel"><p className="eyebrow">Client</p><h2>{order.customer.fullName}</h2><p>{order.customer.phone}</p><p>{order.customer.email}</p><p>{order.customer.wilaya} · {order.customer.commune || order.customer.address}</p>{order.customer.notes && <p>Note : {order.customer.notes}</p>}</section><section className="admin-panel"><p className="eyebrow">Articles</p>{order.items.map((item, index) => <article className="admin-item" key={`${item.productId}-${index}`}><div>{item.type === 'custom_tshirt' ? <div className="admin-previews"><img src={assetUrl(item.frontImage)} alt="Personnalisation face" /><img src={assetUrl(item.backImage)} alt="Personnalisation dos" /></div> : item.image && <img src={item.image} alt={item.name} />}</div><div><h2>{item.name}</h2><p>{item.type === 'custom_tshirt' ? `T-shirt personnalisé · ${item.color}` : `${item.color || ''} · ${item.size || ''}`}</p><p>{item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} DA</p></div></article>)}<div className="checkout-total"><strong>Total</strong><strong>{order.total.toLocaleString('fr-FR')} DA</strong></div></section></div></main>
}
