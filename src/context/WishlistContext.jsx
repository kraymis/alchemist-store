import { createContext, useEffect, useMemo, useState } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('alchemist-wishlist') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem('alchemist-wishlist', JSON.stringify(productIds))
  }, [productIds])

  const value = useMemo(() => ({
    productIds,
    count: productIds.length,
    has: (productId) => productIds.includes(productId),
    toggle: (productId) => setProductIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]),
  }), [productIds])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export { WishlistContext }
