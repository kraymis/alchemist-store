import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api, assetUrl } from '../lib/api'
import { AdminNav } from '../components/AdminNav'
import { useToast } from '../context/useToast'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export function AdminOrderPage() {
  const { id } = useParams()
  const token = window.localStorage.getItem('alchemist-admin-token')
  const [order, setOrder] = useState(null)
  const [state, setState] = useState({ loading: true, error: '', saving: false })
  const { notify } = useToast()
  useEffect(() => {
    if (!token) return
    api(`/admin/orders/${id}`).then(setOrder).catch((error) => setState({ loading: false, error: error.message, saving: false })).finally(() => setState((current) => ({ ...current, loading: false })))
  }, [id, token])
  if (!token) return <Navigate to="/admin/login" replace />
  if (state.loading) return <main className="admin-shell"><p className="admin-message">Chargement de la commande…</p></main>
  if (state.error) return <main className="admin-shell"><p className="form-error" role="alert">{state.error}</p><Link to="/admin/dashboard">Retour</Link></main>
  const updateStatus = async (event) => {
    setState((current) => ({ ...current, saving: true }))
    try { setOrder(await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: event.target.value }) })); notify('Commande mise à jour.') } catch (error) { setState((current) => ({ ...current, error: error.message })); notify(error.message, 'error') } finally { setState((current) => ({ ...current, saving: false })) }
  }
  return <main className="admin-shell"><AdminNav /><header className="admin-header"><div><Link className="text-link" to="/admin/dashboard">← Commandes</Link><p className="eyebrow">Détail · {new Date(order.createdAt).toLocaleString('fr-FR')}</p><h1>#{order.id.slice(-8)}</h1></div><select value={order.status} onChange={updateStatus} disabled={state.saving}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></header><div className="admin-detail-grid"><section className="admin-panel"><p className="eyebrow">Client</p><h2>{order.customer.fullName}</h2><p>Téléphone : {order.customer.phone}</p>{order.customer.email && <p>Email : {order.customer.email}</p>}<p>Wilaya : {order.customer.wilaya}</p><p>Adresse : {order.customer.commune || order.customer.address}</p>{order.customer.notes && <p>Note : {order.customer.notes}</p>}</section><section className="admin-panel"><p className="eyebrow">Articles</p>{order.items.map((item, index) => <article className="admin-item" key={`${item.productId}-${index}`}><div>{item.type === 'custom_tshirt' ? <div className="admin-previews"><a href={assetUrl(item.frontImage)} target="_blank" rel="noreferrer"><img src={assetUrl(item.frontImage)} alt="Personnalisation face" /></a><a href={assetUrl(item.backImage)} target="_blank" rel="noreferrer"><img src={assetUrl(item.backImage)} alt="Personnalisation dos" /></a></div> : item.image && <img src={assetUrl(item.image)} alt={item.name} />}</div><div><h2>{item.name}</h2><p>{item.color || '—'} · {item.size || '—'}</p>{item.type === 'custom_tshirt' && <><p>Personnalisation FRONT / BACK sauvegardée.</p>{item.designImage && <a className="text-link" href={assetUrl(item.designImage)} target="_blank" rel="noreferrer">Voir le design utilisé ↗</a>}{item.customizationData && <details><summary>Données de personnalisation</summary><pre>{JSON.stringify(item.customizationData, null, 2)}</pre></details>}</>}<p>{item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} DA = {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} DA</p></div></article>)}<div className="checkout-total"><strong>Total commande</strong><strong>{order.total.toLocaleString('fr-FR')} DA</strong></div></section></div></main>
}
