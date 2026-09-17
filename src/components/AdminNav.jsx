import { Link, NavLink, useNavigate } from 'react-router-dom'

export function AdminNav() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('alchemist-admin-token'); localStorage.removeItem('alchemist-admin-user'); navigate('/admin/login') }
  return <nav className="admin-nav"><Link to="/admin/dashboard" className="admin-brand">A <span>The Alchemist Store</span></Link><div><NavLink to="/admin/dashboard">Dashboard</NavLink><NavLink to="/admin/products">Produits</NavLink><NavLink to="/admin/products/new">Ajouter un produit</NavLink><button type="button" onClick={logout}>Déconnexion</button></div></nav>
}
