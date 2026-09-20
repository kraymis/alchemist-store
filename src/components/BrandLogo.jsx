import { Link } from 'react-router-dom'
import { store } from '../data/store'

export function BrandLogo({ className = '', onClick }) {
  return (
    <Link to="/" className={`wordmark ${className}`.trim()} onClick={onClick} aria-label={store.name}>
      <span className="wordmark-mark" aria-hidden="true">A</span>
      <span>{store.name}</span>
    </Link>
  )
}
