import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { api, assetUrl } from '../lib/api'
import { AdminNav } from '../components/AdminNav'
import { useToast } from '../context/useToast'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

function fileExtension(file) {
  return (file.mimeType?.split('/')[1] || file.originalName?.split('.').pop() || 'file').replace('svg+xml', 'svg').toUpperCase()
}

function previewFiles(item) {
  return [
    (item.frontPreview || item.frontImage) ? { url: item.frontPreview || item.frontImage, label: 'FRONT' } : null,
    (item.backPreview || item.backImage) ? { url: item.backPreview || item.backImage, label: 'BACK' } : null,
  ].filter((file, index, files) => file && files.findIndex((candidate) => candidate?.url === file.url) === index)
}

function originalDesignFiles(item) {
  return (Array.isArray(item.designFiles) ? item.designFiles : [
    item.designImage ? { url: item.designImage, originalName: 'Design face', role: 'front-design' } : null,
    item.backDesignImage ? { url: item.backDesignImage, originalName: 'Design dos', role: 'back-design' } : null,
  ]).filter((file, index, files) => file?.url && files.findIndex((candidate) => candidate?.url === file.url) === index)
}

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
  const downloadFile = async (file) => {
    try {
      const response = await fetch(assetUrl(file.url))
      if (!response.ok) throw new Error('Fichier introuvable')
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = file.originalName || 'customer-design-file'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      notify(error.message, 'error')
    }
  }
  return <main className="admin-shell"><AdminNav /><header className="admin-header"><div><Link className="text-link" to="/admin/dashboard">← Commandes</Link><p className="eyebrow">Détail · {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : '—'}</p><h1>#{String(orderId).slice(-8)}</h1></div><select value={order.status || 'pending'} onChange={updateStatus} disabled={state.saving}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></header><div className="admin-detail-grid"><section className="admin-panel"><p className="eyebrow">Client</p><h2>{customer.fullName || 'Client sans nom'}</h2><p>Téléphone : {customer.phone || '—'}</p>{customer.email && <p>Email : {customer.email}</p>}<p>Wilaya : {customer.wilaya || '—'}</p><p>Adresse : {customer.commune || customer.address || customer.communeAddress || '—'}</p>{customer.notes && <p>Note : {customer.notes}</p>}</section><section className="admin-panel"><p className="eyebrow">Articles</p>{items.length ? items.map((item, index) => { const previews = previewFiles(item); const files = originalDesignFiles(item); return <article className="admin-item" key={`${item.productId || item.name || 'item'}-${index}`}><div>{item.type === 'custom_tshirt' ? <div className="admin-previews">{previews.map((preview) => <a key={preview.url} href={assetUrl(preview.url)} target="_blank" rel="noreferrer"><img src={assetUrl(preview.url)} alt={`Personnalisation ${preview.label.toLowerCase()}`} /></a>)}</div> : item.image && <img src={assetUrl(item.image)} alt={item.name || 'Produit'} />}</div><div><h2>{item.name || 'Article'}</h2><p>{item.color || '—'} · {item.size || '—'}</p>{item.type === 'custom_tshirt' && <><p>Personnalisation FRONT / BACK sauvegardée.</p>{files.length > 0 && <div className="customer-design-files"><strong>CUSTOMER DESIGN FILES</strong>{files.map((file) => <div className="customer-design-file" key={file.url}>{file.mimeType?.startsWith('image/') && <img src={assetUrl(file.url)} alt="" /> }<span><b>{file.originalName || file.role || 'Fichier original'}</b><small>{fileExtension(file)} · Original customer file</small></span><button type="button" onClick={() => downloadFile(file)}>Download</button></div>)}</div>}{item.customizationData && <details><summary>Données de personnalisation</summary><pre>{JSON.stringify(item.customizationData, null, 2)}</pre></details>}</>}<p>{Number(item.quantity || 0)} × {Number(item.unitPrice || 0).toLocaleString('fr-FR')} DA = {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString('fr-FR')} DA</p></div></article> }) : <p className="admin-message">Aucun article dans cette commande.</p>}<div className="checkout-total"><strong>Total commande</strong><strong>{Number(order.total || 0).toLocaleString('fr-FR')} DA</strong></div></section></div></main>
}
