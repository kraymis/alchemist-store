import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  return <section className="page-section cart-page">
    <div className="page-intro"><p className="eyebrow">Votre sélection</p><h1>Panier</h1><p>{items.length ? `${items.length} article${items.length > 1 ? 's' : ''}` : 'Votre panier est vide.'}</p></div>
    {items.length ? <div className="cart-layout"><div className="cart-list">{items.map((item) => <div className="cart-line" key={item.id}>
      <div className="cart-line-visual">{item.customized && item.customization?.frontPreview ? <div className="custom-previews"><img src={item.customization.frontPreview} alt={`${item.name} aperçu face`} />{item.customization.backPreview && <img src={item.customization.backPreview} alt={`${item.name} aperçu dos`} />}</div> : item.image ? <img src={item.image} alt={item.name} /> : <span className={`product-image-${item.visual}`} />}</div>
      <div><p className="product-category">{item.customized ? 'T-shirt personnalisé' : `${item.color || ''} · ${item.size || ''}`}</p><h3>{item.name}</h3>{item.customized && <small className="custom-badge">Face et dos personnalisés</small>}<button type="button" onClick={() => removeItem(item.id)}>Supprimer</button></div>
      <div className="quantity-row"><button type="button" aria-label="Diminuer la quantité" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button type="button" aria-label="Augmenter la quantité" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div><strong>{(item.price * item.quantity).toLocaleString('fr-FR')} DA</strong>
    </div>)}<button className="cart-clear" type="button" onClick={clearCart}>Vider le panier</button></div><aside className="cart-summary"><p className="eyebrow">Résumé</p><div><span>Sous-total</span><strong>{subtotal.toLocaleString('fr-FR')} DA</strong></div><p>La livraison et le paiement seront confirmés lors de la commande.</p><button className="button button-dark" type="button" onClick={() => navigate('/checkout')}>Passer la commande <span>→</span></button></aside></div> : <div className="empty-state"><h2>Votre panier est vide.</h2><p>Découvrez les pièces de la boutique et ajoutez vos favorites.</p><Link className="button button-dark" to="/shop">Découvrir la boutique</Link></div>}
  </section>
}
