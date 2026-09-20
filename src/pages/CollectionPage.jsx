import { Link, useParams } from 'react-router-dom'
import { collections } from '../data/store'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../lib/products'
export function CollectionPage() {
  const { collectionId } = useParams()
  const { products, loading, error, retry } = useProducts()
  const collection = collections.find((item) => item.id === collectionId)
  if (!collection) return <section className="page-section empty-state"><h1>Collection introuvable</h1><Link className="button button-dark" to="/collections">Retour aux collections</Link></section>
  const collectionProducts = products.filter((product) => product.collection === collection.id)
  if (loading) return <section className="page-section"><div className="page-intro"><p className="eyebrow">Collection</p><h1>Chargement…</h1></div><div className="shop-grid shop-skeleton" aria-busy="true">{[1, 2, 3].map((item) => <div className="product-skeleton" key={item} />)}</div></section>
  if (error) return <section className="page-section empty-state"><h1>Impossible de charger cette collection</h1><p>{error}</p><button className="button button-dark" type="button" onClick={retry}>Réessayer</button></section>
  return <section className="page-section"><p className="breadcrumbs"><Link to="/collections">Collections</Link> / {collection.name}</p><div className="collection-hero" style={{ backgroundImage: `url(${collection.image})` }}><div className="collection-hero-overlay"><p className="eyebrow">{collection.eyebrow}</p><h1>{collection.name}</h1></div></div><div className="page-intro collection-intro"><p>{collection.description}</p><span>{collectionProducts.length} articles</span></div><div className="shop-grid">{collectionProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div></section>
}
