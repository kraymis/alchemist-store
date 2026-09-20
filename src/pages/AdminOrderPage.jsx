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
  const orderId = order.id || order._id || id
  const customer = order.customer || {}
  const items = Array.isArray(order.items) ? order.items : []
  return <main className="admin-shell"><AdminNav /><header className="admin-header"><div><Link className="text-link" to="/admin/dashboard">← Commandes</Link><p className="eyebrow">Détail · {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '—'}</p><h1>#{String(orderId).slice(-8)}</h1></div><select value={order.status || 'pending'} onChange={updateStatus} disabled={state.saving}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></header><div className="admin-detail-grid"><section className="admin-panel"><p className="eyebrow">Client</p><h2>{customer.fullName || 'Client sans nom'}</h2><p>Téléphone : {customer.phone || '—'}</p>{customer.email && <p>Email : {customer.email}</p>}<p>Wilaya : {customer.wilaya || '—'}</p><p>Adresse : {customer.commune || customer.address || customer.communeAddress || '—'}</p>{customer.notes && <p>Note : {customer.notes}</p>}</section><section className="admin-panel"><p className="eyebrow">Articles</p>{items.length ? items.map((item, index) => <article className="admin-item" key={`${item.productId || item.name || 'item'}-${index}`}><div>{item.type === 'custom_tshirt' ? <div className="admin-previews">{item.frontImage && <a href={assetUrl(item.frontImage)} target="_blank" rel="noreferrer"><img src={assetUrl(item.frontImage)} alt="Personnalisation face" /></a>}{item.backImage && <a href={assetUrl(item.backImage)} target="_blank" rel="noreferrer"><img src={assetUrl(item.backImage)} alt="Personnalisation dos" /></a>}</div> : item.image && <img src={assetUrl(item.image)} alt={item.name || 'Produit'} />}</div><div><h2>{item.name || 'Article'}</h2><p>{item.color || '—'} · {item.size || '—'}</p>{item.type === 'custom_tshirt' && <><p>Personnalisation FRONT / BACK sauvegardée.</p>{item.designImage && <a className="text-link" href={assetUrl(item.designImage)} target="_blank" rel="noreferrer">Voir le design utilisé ↗</a>}{item.customizationData && <details><summary>Données de personnalisation</summary><pre>{JSON.stringify(item.customizationData, null, 2)}</pre></details>}</>}<p>{Number(item.quantity || 0)} × {Number(item.unitPrice || 0).toLocaleString('fr-FR')} DA = {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString('fr-FR')} DA</p></div></article>) : <p className="admin-message">Aucun article dans cette commande.</p>}<div className="checkout-total"><strong>Total commande</strong><strong>{Number(order.total || 0).toLocaleString('fr-FR')} DA</strong></div></section></div></main>
}
