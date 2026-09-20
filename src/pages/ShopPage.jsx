import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useWishlist } from '../context/useWishlist'
import { useProducts } from '../lib/products'
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../data/catalog'

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function ShopPage() {
  const { products, loading, error, retry } = useProducts()
  const [params, setParams] = useSearchParams()
  const { productIds } = useWishlist()
  const query = params.get('q') || ''
  const category = params.get('category') || 'Tous'
  const size = params.get('size') || 'Tous'
  const color = params.get('color') || 'Tous'; const collection = params.get('collection') || 'Tous'; const price = params.get('price') || 'Tous'
  const sort = params.get('sort') || 'featured'
  const wishlistOnly = params.get('wishlist') === 'true'
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1)
  const pageSize = 9

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'Tous' || value === 'featured') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
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
        && (collection === 'Tous' || product.collection === collection)
        && (price === 'Tous' || (price === 'under-3000' ? product.price < 3000 : price === '3000-5000' ? product.price >= 3000 && product.price <= 5000 : product.price > 5000))
        && (!wishlistOnly || productIds.includes(product.id))
    })
    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'newest') return Number(b.newest) - Number(a.newest)
      return Number(b.featured) - Number(a.featured)
    })
  }, [products, query, category, size, color, collection, price, sort, wishlistOnly, productIds])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const setPage = (nextPage) => {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const reset = () => setParams({})
  const title = wishlistOnly ? 'Vos favoris' : 'Boutique'
  const intro = wishlistOnly
    ? 'Retrouvez les pièces que vous avez mises de côté.'
    : 'Découvrez notre sélection de vêtements et de pièces du moment.'

  return <section className="page-section shop-page">
    <div className="page-intro"><p className="eyebrow">The Alchemist Store</p><h1>{title}</h1><p>{intro}</p><span>{loading ? 'Chargement…' : `${filtered.length} articles`}</span></div>
    <div className="shop-toolbar"><label className="shop-search">⌕<input value={query} onChange={(event) => updateParam('q', event.target.value)} placeholder="Rechercher un article..." /></label><select value={sort} onChange={(event) => updateParam('sort', event.target.value)} aria-label="Trier les articles"><option value="featured">Mis en avant</option><option value="newest">Nouveautés</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="name">Nom A–Z</option></select></div>
    <div className="shop-filters"><label className="category-filter">Catégorie<select value={category} onChange={(event) => updateParam('category', event.target.value)}><option>Tous</option>{PRODUCT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Taille<select value={size} onChange={(event) => updateParam('size', event.target.value)}><option>Tous</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label><label>Couleur<select value={color} onChange={(event) => updateParam('color', event.target.value)}><option>Tous</option>{PRODUCT_COLORS.filter(({ name }) => products.some((product) => product.colors?.includes(name))).map(({ name }) => <option key={name}>{name}</option>)}</select></label><label>Collection<select value={collection} onChange={(event) => updateParam('collection', event.target.value)}><option>Tous</option>{[...new Set(products.map((product) => product.collection).filter(Boolean))].map((item) => <option key={item}>{item}</option>)}</select></label><label>Prix<select value={price} onChange={(event) => updateParam('price', event.target.value)}><option value="Tous">Tous</option><option value="under-3000">Moins de 3 000 DA</option><option value="3000-5000">3 000 – 5 000 DA</option><option value="over-5000">Plus de 5 000 DA</option></select></label></div>
    {loading ? <div className="shop-grid shop-skeleton" aria-label="Chargement des produits" aria-busy="true">{[1, 2, 3, 4].map((item) => <div className="product-skeleton" key={item} />)}</div>
      : error ? <div className="empty-state"><h2>Impossible de charger la boutique</h2><p>{error}</p><button className="button button-dark" type="button" onClick={retry}>Réessayer</button></div>
      : filtered.length ? <><div className="shop-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div>{pageCount > 1 && <nav className="shop-pagination" aria-label="Pagination de la boutique"><button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>← Précédent</button><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <button className={item === currentPage ? 'active' : ''} type="button" onClick={() => setPage(item)} key={item} aria-current={item === currentPage ? 'page' : undefined}>{String(item).padStart(2, '0')}</button>)}</div><button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>Suivant →</button></nav>}</>
      : <div className="empty-state"><h2>{wishlistOnly ? 'Vos favoris sont encore vides' : 'Aucun article trouvé'}</h2><p>{wishlistOnly ? 'Ajoutez un cœur sur une pièce pour la retrouver ici.' : 'Essayez de modifier votre recherche ou vos filtres.'}</p><button className="button button-dark" type="button" onClick={reset}>{wishlistOnly ? 'Voir toute la boutique' : 'Réinitialiser les filtres'}</button></div>}
  </section>
}
