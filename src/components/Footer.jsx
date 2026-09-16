import { Link } from 'react-router-dom'
import { store } from '../data/store'

export function Footer({ theme, onToggleTheme }) {
  return (
    <footer className="footer">
      <div className="footer-top"><Link to="/" className="wordmark"><span className="wordmark-mark">A</span><span>{store.name}</span></Link><p>Des vêtements pour votre quotidien, à Mostaganem.</p></div>
      <div className="footer-columns">
        <div><span className="footer-label">Navigation</span><Link to="/shop">Boutique</Link><Link to="/collections">Collections</Link><Link to="/about">À propos</Link><Link to="/contact">Contact</Link></div>
        <div><span className="footer-label">Contact</span><span>{store.address}</span><a href={`tel:${store.phone}`}>{store.phoneDisplay}</a><a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a></div>
        <div><span className="footer-label">La boutique</span><span>{store.openingStatus}</span><span>{store.plusCode}</span></div>
      </div>
      <div className="footer-bottom"><span>© 2026 {store.name}</span><button type="button" onClick={onToggleTheme}>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'} · {theme === 'dark' ? '☀︎' : '☾'}</button></div>
    </footer>
  )
}
