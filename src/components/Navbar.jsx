import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { store } from '../data/store'
import { useCart } from '../context/useCart'

export function Navbar({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { count } = useCart()
  const submitSearch = (event) => {
    event.preventDefault()
    navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <Link to="/" className="wordmark" onClick={() => setMenuOpen(false)}>
        <span className="wordmark-mark">A</span><span>{store.name}</span>
      </Link>
      <nav className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Navigation principale">
        <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Boutique</NavLink>
        <NavLink to="/collections" onClick={() => setMenuOpen(false)}>Collections</NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>À propos</NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        <NavLink to="/customize" onClick={() => setMenuOpen(false)}>Personnaliser</NavLink>
        <a className="mobile-instagram-link" href={store.instagram} target="_blank" rel="noreferrer">Instagram</a>
      </nav>
      <div className="nav-tools">
        <button className="icon-button" type="button" aria-label="Rechercher" onClick={() => setSearchOpen((open) => !open)}>⌕</button>
        <Link className="icon-button nav-desktop-only" to="/shop?wishlist=true" aria-label="Favoris">♡</Link>
        <Link className="icon-button cart-button" to="/cart" aria-label="Panier">▢<span>{count}</span></Link>
        <button className="theme-button" type="button" onClick={onToggleTheme} aria-label="Changer de thème">{theme === 'dark' ? '☀︎' : '☾'}</button>
        <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Ouvrir le menu"><span /><span /></button>
      </div>
      {searchOpen && (
        <form className="nav-search-form" onSubmit={submitSearch}>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un article..." aria-label="Rechercher un article" />
          <button type="submit">Rechercher</button>
        </form>
      )}
    </header>
  )
}
