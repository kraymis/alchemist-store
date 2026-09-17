import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductPage } from './pages/ProductPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { CollectionPage } from './pages/CollectionPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminOrderPage } from './pages/AdminOrderPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductFormPage } from './pages/AdminProductFormPage'

const CustomizerPage = lazy(() => import('./pages/CustomizerPage').then((module) => ({ default: module.CustomizerPage })))

function App() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('alchemist-theme') || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('alchemist-theme', theme)
  }, [theme])
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
          <div className="site-shell">
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/new" element={<AdminProductFormPage />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
            <Route element={<MainLayout theme={theme} onToggleTheme={toggleTheme} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:productId" element={<ProductPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:collectionId" element={<CollectionPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/customize" element={<Suspense fallback={<main className="page-section"><p className="eyebrow">Chargement</p><h1>Préparation de l’atelier…</h1></main>}><CustomizerPage /></Suspense>} />
              <Route path="/customize/:designId" element={<Suspense fallback={<main className="page-section"><p className="eyebrow">Chargement</p><h1>Préparation de l’atelier…</h1></main>}><CustomizerPage /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
