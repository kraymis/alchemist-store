import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useWishlist } from '../context/useWishlist'
import { products } from '../data/store'

const categories = ['Tous', 'T-shirts', 'Hoodies', 'Sweatshirts', 'Pants', 'Accessories']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const { productIds } = useWishlist()
  const query = params.get('q') || ''
  const category = params.get('category') || 'Tous'
  const size = params.get('size') || 'Tous'
  const color = params.get('color') || 'Tous'
  const sort = params.get('sort') || 'featured'
  const wishlistOnly = params.get('wishlist') === 'true'

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'Tous' || value === 'featured') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    const result = products.filter((product) => {
      const searchable = [product.name, product.category, product.description, product.collection, ...(product.tags || [])].join(' ').toLowerCase()
      return (!normalized || searchable.includes(normalized))
        && (category === 'Tous' || product.category === category)
        && (size === 'Tous' || product.sizes?.includes(size))
        && (color === 'Tous' || product.colors?.includes(color))
        && (!wishlistOnly || productIds.includes(product.id))
    })
    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'newest') return Number(b.newest) - Number(a.newest)
      return Number(b.featured) - Number(a.featured)
    })
  }, [query, category, size, color, sort, wishlistOnly, productIds])

  const reset = () => setParams({})
  const title = wishlistOnly ? 'Vos favoris' : 'Boutique'
  const intro = wishlistOnly
    ? 'Retrouvez les pièces que vous avez mises de côté.'
    : 'Découvrez notre sélection de vêtements et de pièces du moment.'

  return <section className="page-section shop-page">
    <div className="page-intro"><p className="eyebrow">The Alchemist Store</p><h1>{title}</h1><p>{intro}</p><span>{filtered.length} articles</span></div>
    <div className="shop-toolbar"><label className="shop-search">⌕<input value={query} onChange={(event) => updateParam('q', event.target.value)} placeholder="Rechercher un article..." /></label><select value={sort} onChange={(event) => updateParam('sort', event.target.value)} aria-label="Trier les articles"><option value="featured">Mis en avant</option><option value="newest">Nouveautés</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="name">Nom A–Z</option></select></div>
    <div className="shop-filters"><div><span>Catégorie</span>{categories.map((item) => <button className={category === item ? 'active' : ''} type="button" onClick={() => updateParam('category', item)} key={item}>{item}</button>)}</div><label>Taille<select value={size} onChange={(event) => updateParam('size', event.target.value)}><option>Tous</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Couleur<select value={color} onChange={(event) => updateParam('color', event.target.value)}><option>Tous</option>{[...new Set(products.flatMap((product) => product.colors || []))].map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {filtered.length ? <div className="shop-grid">{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><h2>{wishlistOnly ? 'Vos favoris sont encore vides' : 'Aucun article trouvé'}</h2><p>{wishlistOnly ? 'Ajoutez un cœur sur une pièce pour la retrouver ici.' : 'Essayez de modifier votre recherche ou vos filtres.'}</p><button className="button button-dark" type="button" onClick={reset}>{wishlistOnly ? 'Voir toute la boutique' : 'Réinitialiser les filtres'}</button></div>}
  </section>
}
