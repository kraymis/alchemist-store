import { Link } from 'react-router-dom'
import { collections } from '../data/store'
import { useProducts } from '../lib/products'
export function CollectionsPage() {
  const { products, loading, error, retry } = useProducts()
  if (loading) return <section className="page-section"><div className="page-intro"><p className="eyebrow">The Alchemist Store</p><h1>Collections</h1><p>Chargement des sélections…</p></div><div className="collection-page-grid shop-skeleton" aria-busy="true">{[1, 2, 3].map((item) => <div className="product-skeleton" key={item} />)}</div></section>
  if (error) return <section className="page-section empty-state"><h1>Impossible de charger les collections</h1><p>{error}</p><button className="button button-dark" type="button" onClick={retry}>Réessayer</button></section>
  return <section className="page-section"><div className="page-intro"><p className="eyebrow">The Alchemist Store</p><h1>Collections</h1><p>Des sélections pensées pour construire votre vestiaire, saison après saison.</p></div><div className="collection-page-grid">{collections.map((collection) => <Link className={`collection-feature collection-feature-${collection.visual}`} to={`/collections/${collection.id}`} key={collection.id}><div className="collection-art" style={{ backgroundImage: `url(${collection.image})` }} /><div className="collection-content"><p className="eyebrow">{collection.eyebrow}</p><h3>{collection.name}</h3><p className="collection-description">{collection.description}</p><span className="text-link">{products.filter((product) => product.collection === collection.id).length} articles · Explorer <span>→</span></span></div></Link>)}</div></section>
}
