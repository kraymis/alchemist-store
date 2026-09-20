import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collections, store } from '../data/store'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../lib/products'
import { assetUrl } from '../lib/api'

export function HomePage() {
  const [locationMessage, setLocationMessage] = useState('')
  const { products, loading, error, retry } = useProducts()
  const featured = products.filter((product) => product.featured)
  const heroProduct = products[1] || products[0]
  const editorialProduct = featured[1] || products[2] || products[0]
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.plusCode}, ${store.city}, Algérie`)}`
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }
    setLocationMessage('Autorisation de localisation en cours…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(`${store.plusCode}, ${store.city}, Algérie`)}`, '_blank', 'noopener,noreferrer')
        setLocationMessage('Itinéraire ouvert dans Google Maps.')
      },
      () => setLocationMessage('La localisation n’a pas été autorisée.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  if (loading) return <main id="top" className="page-section"><div className="page-intro"><p className="eyebrow">The Alchemist Store</p><h1>Chargement de la sélection…</h1></div><div className="shop-grid shop-skeleton" aria-busy="true">{[1, 2, 3, 4].map((item) => <div className="product-skeleton" key={item} />)}</div></main>
  if (error) return <main id="top" className="page-section empty-state"><p className="eyebrow">The Alchemist Store</p><h1>La sélection est temporairement indisponible.</h1><p>{error}</p><button className="button button-dark" type="button" onClick={retry}>Réessayer</button></main>
  return (
    <main id="top">
      <section className="hero" style={heroProduct ? { backgroundImage: `linear-gradient(90deg, rgba(16,15,13,.72), rgba(16,15,13,.38) 48%, rgba(16,15,13,.08)), url("${assetUrl(heroProduct.images?.[0])}")` } : undefined}>
        <div className="hero-copy"><p className="eyebrow">Boutique de vêtements · Mostaganem</p><h1>Le style de tous les jours, avec une vraie présence.</h1><p className="hero-description">Découvrez une sélection de vêtements et d&apos;accessoires pensés pour exprimer votre style, simplement.</p><Link className="button button-dark" to="/shop">Découvrir la boutique <span>→</span></Link><div className="hero-meta"><span>{store.rating}</span><span>{store.reviewCount} avis Google</span><span>Mostaganem, Algérie</span></div></div>
        <div className="hero-sticker">The<br />Alchemist<br />Store</div><p className="hero-caption">Sélection actuelle <span>01 / 06</span></p>
      </section>
      <div className="marquee" aria-label="Message de la boutique"><span>THE ALCHEMIST STORE&nbsp; — &nbsp;NEW DROP&nbsp; — &nbsp;MOSTAGANEM&nbsp; — &nbsp;STYLE YOUR WAY&nbsp; — &nbsp;</span><span>THE ALCHEMIST STORE&nbsp; — &nbsp;NEW DROP&nbsp; — &nbsp;MOSTAGANEM&nbsp; — &nbsp;STYLE YOUR WAY&nbsp; — &nbsp;</span></div>
      <section className="featured section"><div className="section-heading"><div><p className="eyebrow">La sélection</p><h2>Pièces choisies pour vous.</h2></div><Link to="/shop" className="text-link">Voir toute la boutique <span>→</span></Link></div><div className="featured-layout">{featured[0] && <ProductCard product={featured[0]} featured />}<div className="featured-side">{featured.slice(1, 3).map((product) => <ProductCard product={product} key={product.id} />)}</div></div></section>
      <section className="editorial-banner section"><div className="editorial-visual">{editorialProduct && <img src={assetUrl(editorialProduct.images?.[0])} alt={editorialProduct.name} />}<span className="editorial-note">New<br />season</span></div><div className="editorial-copy"><p className="eyebrow">La sélection du moment</p><h2>Une garde-robe qui vous ressemble.</h2><p>Des essentiels à porter souvent, des silhouettes à faire évoluer, et des pièces qui trouvent naturellement leur place dans votre quotidien.</p><Link className="text-link" to="/shop?sort=newest">Voir les nouveautés <span>→</span></Link></div></section>
      <section className="collections section" id="collections"><div className="section-heading"><div><p className="eyebrow">Collections</p><h2>Trouvez votre rythme.</h2></div><Link to="/collections" className="text-link">Toutes les collections <span>→</span></Link></div><div className="collection-grid">{collections.slice(0, 3).map((collection) => <Link to={`/collections/${collection.id}`} className={`collection-feature collection-feature-${collection.visual}`} key={collection.id}><div className="collection-art" style={{ backgroundImage: `url(${collection.image})` }} /><div className="collection-content"><p className="eyebrow">{collection.eyebrow}</p><h3>{collection.name}</h3><span className="text-link">Découvrir <span>→</span></span></div></Link>)}</div></section>
      <section className="visit section" id="about"><div className="visit-copy"><p className="eyebrow">Nous trouver</p><h2>Passez nous voir à Mostaganem.</h2><p>Retrouvez The Alchemist Store au cœur de Mostaganem pour découvrir la sélection en personne.</p><div className="visit-details"><div><span>Adresse</span><strong>{store.address}</strong></div><div><span>Plus Code</span><strong>{store.plusCode}</strong></div><div><span>Horaires</span><strong>{store.openingStatus}</strong></div></div><div className="visit-actions"><a className="button button-dark" href={mapSearchUrl} target="_blank" rel="noreferrer">Voir sur la carte <span>↗</span></a><button className="button button-outline" type="button" onClick={useMyLocation}>Utiliser ma position <span>⌖</span></button></div>{locationMessage && <p className="location-message" role="status">{locationMessage}</p>}</div><div className="map-placeholder"><iframe title="Localisation de The Alchemist Store à Mostaganem" src={`https://www.google.com/maps?q=${encodeURIComponent(`${store.plusCode}, ${store.city}, Algérie`)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-overlay-label">The Alchemist Store<br /><span>{store.plusCode}</span></div></div></section>
      <section className="social section" id="contact"><div><p className="eyebrow">Suivez-nous</p><h2>Le quotidien, vu par<br /><em>The Alchemist Store.</em></h2></div><div className="social-action"><p>Retrouvez les nouveautés, les pièces disponibles et la vie de la boutique sur Instagram.</p><a className="text-link" href={store.instagram} target="_blank" rel="noreferrer">Voir Instagram <span>↗</span></a></div></section>
    </main>
  )
}
