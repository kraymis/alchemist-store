import { useState } from 'react'
import { collections, products, store } from '../data/store'
import { ProductCard } from './ProductCard'

function SectionHeading({ eyebrow, title, link }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {link && <a href={link.href} className="text-link">{link.label} <span>→</span></a>}
    </div>
  )
}

export function Homepage() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filteredProducts = activeCategory === 'Tous'
    ? products
    : products.filter((product) => product.category === activeCategory)

  return (
    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Boutique de vêtements · Mostaganem</p>
          <h1>Le style de tous les jours, avec une vraie présence.</h1>
          <p className="hero-description">
            Découvrez une sélection de vêtements et d&apos;accessoires pensés pour exprimer votre style, simplement.
          </p>
          <a className="button button-dark" href="#shop">Découvrir la collection <span>→</span></a>
          <div className="hero-meta">
            <span>{store.rating}</span>
            <span>{store.reviewCount} avis Google</span>
            <span>Mostaganem, Algérie</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Sélection de vêtements The Alchemist Store">
          <div className="hero-sticker">The<br />Alchemist<br />Store</div>
          <div className="hero-model">
            <div className="hero-head" />
            <div className="hero-torso"><span>A</span></div>
            <div className="hero-arm hero-arm-left" />
            <div className="hero-arm hero-arm-right" />
            <div className="hero-leg hero-leg-left" />
            <div className="hero-leg hero-leg-right" />
          </div>
          <p className="hero-caption">Sélection actuelle <span>01 / 06</span></p>
        </div>
      </section>

      <section className="featured section" id="featured">
        <SectionHeading eyebrow="La sélection" title="Pièces choisies pour vous." link={{ href: '#shop', label: 'Voir toute la boutique' }} />
        <div className="featured-layout">
          <ProductCard product={products[0]} featured />
          <div className="featured-side">
            <ProductCard product={products[1]} />
            <ProductCard product={products[2]} />
          </div>
        </div>
      </section>

      <section className="editorial-banner section">
        <div className="editorial-visual">
          <span className="editorial-circle" />
          <span className="editorial-garment" />
          <span className="editorial-note">New<br />season</span>
        </div>
        <div className="editorial-copy">
          <p className="eyebrow">La sélection du moment</p>
          <h2>Une garde-robe qui vous ressemble.</h2>
          <p>Des essentiels à porter souvent, des silhouettes à faire évoluer, et des pièces qui trouvent naturellement leur place dans votre quotidien.</p>
          <a className="text-link" href="#collections">Explorer les collections <span>→</span></a>
        </div>
      </section>

      <section className="collections section" id="collections">
        <SectionHeading eyebrow="Collections" title="Trouvez votre rythme." />
        <div className="collection-grid">
          {collections.map((collection) => (
            <a href="#shop" className={`collection-feature collection-feature-${collection.visual}`} key={collection.name}>
              <div className="collection-art" style={{ backgroundImage: `url(${collection.image})` }} />
              <div className="collection-content">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3>{collection.name}</h3>
                <span className="text-link">Découvrir <span>→</span></span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="shop section" id="shop">
        <SectionHeading eyebrow="Boutique" title="Les pièces du moment." link={{ href: '#contact', label: 'Besoin d’aide ?' }} />
        <div className="category-tabs" role="tablist" aria-label="Catégories">
          {['Tous', 'T-shirts', 'Hoodies', 'Sweatshirts', 'Pants', 'Accessories'].map((category) => (
            <button
              className={activeCategory === category ? 'active' : ''}
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              role="tab"
              aria-selected={activeCategory === category}
            >
              {category === 'Tous' ? 'Tout' : category}
            </button>
          ))}
        </div>
        <div className="shop-grid">
          {filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}
        </div>
      </section>

      <section className="visit section" id="about">
        <div className="visit-copy">
          <p className="eyebrow">Nous trouver</p>
          <h2>Passez nous voir à Mostaganem.</h2>
          <p>Retrouvez The Alchemist Store au cœur de Mostaganem pour découvrir la sélection en personne.</p>
          <div className="visit-details">
            <div><span>Adresse</span><strong>{store.address}</strong></div>
            <div><span>Plus Code</span><strong>{store.plusCode}</strong></div>
            <div><span>Horaires</span><strong>{store.openingStatus}</strong></div>
          </div>
          <a className="button button-outline" href="https://www.google.com/maps/search/?api=1&query=W3HP%2B66%20Mostaganem" target="_blank" rel="noreferrer">Itinéraire <span>↗</span></a>
        </div>
        <div className="map-placeholder" aria-label="Carte de localisation à Mostaganem">
          <div className="map-grid" />
          <div className="map-pin"><span>⌖</span><small>The Alchemist Store</small></div>
          <span className="map-label map-label-one">Mostaganem</span>
          <span className="map-label map-label-two">W3HP+66</span>
        </div>
      </section>

      <section className="social section" id="contact">
        <div>
          <p className="eyebrow">Suivez-nous</p>
          <h2>Le quotidien, vu par<br /><em>The Alchemist Store.</em></h2>
        </div>
        <div className="social-action">
          <p>Retrouvez les nouveautés, les pièces disponibles et la vie de la boutique sur Instagram.</p>
          <a className="text-link" href={store.instagram} target="_blank" rel="noreferrer">Voir Instagram <span>↗</span></a>
        </div>
      </section>
    </main>
  )
}
