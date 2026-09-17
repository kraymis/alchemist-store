import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/useCart'
import { products } from '../data/store'

export function ProductPage() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const [size, setSize] = useState(product?.sizes?.[0] || '')
  const [color, setColor] = useState(product?.colors?.[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  if (!product) return <section className="page-section empty-state"><p className="eyebrow">Boutique</p><h1>Article introuvable</h1><p>Cette pièce n’est plus disponible ou n’existe pas.</p><Link className="button button-dark" to="/shop">Retour à la boutique</Link></section>

  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.collection === product.collection)).slice(0, 3)
  const addSelectionToCart = () => {
    for (let index = 0; index < quantity; index += 1) addItem(product, { size, color })
  }

  return <section className="page-section product-page">
    <p className="breadcrumbs"><Link to="/shop">Boutique</Link> / {product.category} / {product.name}</p>
    <div className="product-detail">
      <div className="product-gallery">
        <div className={`product-detail-visual product-image-${product.visual}`}><img src={product.images?.[selectedImage]} alt={`${product.name} vue ${selectedImage + 1}`} /></div>
        <div className="product-thumbnails">{product.images?.map((image, index) => <button className={selectedImage === index ? 'active' : ''} type="button" onClick={() => setSelectedImage(index)} key={image} aria-label={`Voir ${product.name}, vue ${index + 1}`} aria-pressed={selectedImage === index}><img src={image} alt="" /></button>)}</div>
      </div>
      <div className="product-detail-copy">
        <p className="eyebrow">{product.category}</p><h1>{product.name}</h1><strong className="detail-price">{product.price.toLocaleString('fr-FR')} DA</strong><p className="detail-description">{product.description}</p>
        <div className="option-block"><span>Couleur · <b>{color}</b></span><div className="option-row">{product.colors.map((item) => <button className={color === item ? 'option active' : 'option'} type="button" onClick={() => setColor(item)} key={item}>{item}</button>)}</div></div>
        <div className="option-block"><span>Taille · <b>{size}</b></span><div className="option-row">{product.sizes.map((item) => <button className={size === item ? 'option active' : 'option'} type="button" onClick={() => setSize(item)} key={item}>{item}</button>)}</div></div>
        <div className="quantity-row"><button type="button" aria-label="Diminuer la quantité" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Augmenter la quantité" onClick={() => setQuantity(quantity + 1)}>+</button></div>
        <button className="button button-dark add-detail" type="button" onClick={addSelectionToCart}>Ajouter au panier <span>→</span></button><p className="availability">Disponible en boutique · Retrait à Mostaganem</p>
      </div>
    </div>
    {related.length > 0 && <div className="related"><div className="section-heading"><div><p className="eyebrow">À découvrir aussi</p><h2>Vous pourriez aimer.</h2></div></div><div className="shop-grid">{related.map((item) => <ProductCard product={item} key={item.id} />)}</div></div>}
  </section>
}
