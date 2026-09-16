import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'

export function ProductCard({ product, featured = false }) {
  const { addItem } = useCart()
  return (
    <article className={`product-card ${featured ? 'featured-product' : ''}`}>
      <Link to={`/shop/${product.id}`} className={`product-image product-image-${product.visual}`} aria-label={`Voir ${product.name}`}>
        {product.label && <span className="product-label">{product.label}</span>}
        <img className="product-photo product-photo-primary" src={product.images?.[0]} alt={product.name} loading="lazy" />
        <img className="product-photo product-photo-secondary" src={product.images?.[1]} alt="" loading="lazy" />
        <span className="view-product">Voir le produit <span>→</span></span>
      </Link>
      <div className="product-info"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3><div className="color-dots">{product.colors?.slice(0, 3).map((color) => <span title={color} key={color} />)}</div></div><div className="product-price"><strong>{product.price.toLocaleString('fr-FR')} DA</strong><button type="button" onClick={() => addItem(product)}>Ajouter</button></div></div>
    </article>
  )
}
