import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'

const initialCustomer = { fullName: '', phone: '', email: '', wilaya: '', communeAddress: '', notes: '' }

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [customer, setCustomer] = useState(initialCustomer)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const update = (field) => (event) => setCustomer((current) => ({ ...current, [field]: event.target.value }))

  if (order) return <section className="page-section checkout-page confirmation"><p className="eyebrow">Commande reçue</p><h1>Merci pour votre commande.</h1><p>Votre référence est <strong>{order.id}</strong>. Nous vous contacterons au {order.customer.phone} pour confirmer la livraison.</p><Link className="button button-dark" to="/shop">Continuer la boutique</Link></section>
  if (!items.length) return <section className="page-section empty-state"><h1>Votre panier est vide.</h1><Link className="button button-dark" to="/shop">Retour à la boutique</Link></section>

  const submit = (event) => {
    event.preventDefault()
    if (!customer.fullName.trim() || !customer.phone.trim() || !customer.wilaya.trim() || !customer.communeAddress.trim()) {
      setError('Veuillez renseigner votre nom, téléphone, wilaya et commune/adresse.')
      return
    }
    const savedOrder = { id: `ALS-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), customer, items, subtotal, total: subtotal }
    const existing = JSON.parse(window.localStorage.getItem('alchemist-orders') || '[]')
    window.localStorage.setItem('alchemist-orders', JSON.stringify([...existing, savedOrder]))
    clearCart()
    setOrder(savedOrder)
  }

  return <section className="page-section checkout-page"><div className="page-intro"><p className="eyebrow">Finaliser</p><h1>Votre commande.</h1><p>Paiement à la livraison, confirmé avec notre équipe.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2>Informations de livraison</h2>{error && <p className="form-error" role="alert">{error}</p>}<label>Nom complet<input required value={customer.fullName} onChange={update('fullName')} /></label><label>Téléphone<input required type="tel" value={customer.phone} onChange={update('phone')} /></label><label>Email <span>(facultatif)</span><input type="email" value={customer.email} onChange={update('email')} /></label><label>Wilaya<input required value={customer.wilaya} onChange={update('wilaya')} /></label><label>Commune / adresse<input required value={customer.communeAddress} onChange={update('communeAddress')} /></label><label>Notes <span>(facultatif)</span><textarea rows="4" value={customer.notes} onChange={update('notes')} /></label><button className="button button-dark" type="submit">Confirmer la commande <span>→</span></button></form><aside className="cart-summary checkout-summary"><p className="eyebrow">Résumé</p>{items.map((item) => <div className="checkout-item" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{(item.price * item.quantity).toLocaleString('fr-FR')} DA</strong></div>)}<div className="checkout-total"><span>Total</span><strong>{subtotal.toLocaleString('fr-FR')} DA</strong></div></aside></div></section>
}
