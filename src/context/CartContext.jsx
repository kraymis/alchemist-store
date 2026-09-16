import { createContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function createId(prefix = 'item') {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('alchemist-cart') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem('alchemist-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, options = {}) => {
    const size = options.size || product.sizes?.[0] || 'M'
    const color = options.color || product.colors?.[0] || 'Noir'
    const customization = options.customization
    const customized = Boolean(customization?.productType === 'custom-tshirt' || product.id === 'custom-tshirt')
    setItems((current) => {
      if (customized) return [...current, {
        id: createId('custom-tshirt'),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: options.image || customization?.frontPreview,
        visual: product.visual,
        size,
        color,
        quantity: options.quantity || 1,
        customized: true,
        customization,
      }]
      const id = `${product.id}::${size}::${color}`
      const existing = current.find((item) => item.id === id)
      if (existing) return current.map((item) => item.id === id ? { ...item, quantity: item.quantity + (options.quantity || 1) } : item)
      return [...current, { id, productId: product.id, name: product.name, price: product.price, image: options.image || product.images?.[0], size, color, visual: product.visual, quantity: options.quantity || 1, customized: false }]
    })
  }

  const updateQuantity = (id, quantity) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0))
  }
  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const clearCart = () => setItems([])
  const value = useMemo(() => ({
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext }
