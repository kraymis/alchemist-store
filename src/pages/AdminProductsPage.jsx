import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api, assetUrl } from '../lib/api'
import { useToast } from '../context/useToast'
import { AdminNav } from '../components/AdminNav'

export function AdminProductsPage() {
  const token = localStorage.getItem('alchemist-admin-token'); const { notify } = useToast(); const [products, setProducts] = useState([]); const [q, setQ] = useState(''); const [loading, setLoading] = useState(true)
  const load = () => api('/admin/products').then(setProducts).catch(e => notify(e.message, 'error')).finally(() => setLoading(false)); useEffect(() => { if (token) load() }, [token])
  if (!token) return <Navigate to="/admin/login" replace />
  const remove = async (product) => { if (!window.confirm(`Supprimer « ${product.name} » ?`)) return; try { await api(`/admin/products/${product.id}`, { method: 'DELETE' }); setProducts(v => v.filter(x => x.id !== product.id)); notify('Produit supprimé.') } catch (e) { notify(e.message, 'error') } }
  const shown = products.filter(p => `${p.name} ${p.sku || ''} ${p.category}`.toLowerCase().includes(q.toLowerCase()))
  return <main className="admin-shell"><AdminNav /><header className="admin-header"><div><p className="eyebrow">Catalogue</p><h1>Produits.</h1></div><Link className="button button-dark" to="/admin/products/new">Ajouter un produit</Link></header><input className="admin-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher par nom, catégorie ou SKU" />{loading ? <p className="admin-message">Chargement…</p> : <div className="admin-products">{shown.map(p => <article key={p.id} className="admin-product-row"><img src={assetUrl(p.images?.[0])} alt="" /><div><strong>{p.name}</strong><span>{p.category} · {p.sku || 'Sans SKU'}</span></div><div><strong>{p.price.toLocaleString('fr-FR')} DA</strong><span>Stock : {p.stock}</span></div><b className={`status ${p.active ? '' : 'status-cancelled'}`}>{p.active ? 'actif' : 'inactif'}</b><div className="admin-row-actions"><Link to={`/admin/products/${p.id}/edit`}>Modifier</Link><button type="button" onClick={() => remove(p)}>Supprimer</button></div></article>)}{!shown.length && <p className="admin-message">Aucun produit trouvé.</p>}</div>}</main>
}
