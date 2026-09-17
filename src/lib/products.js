import { useEffect, useState } from 'react'
import { api } from './api'

export function useProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  useEffect(() => { let alive = true; api('/products').then((products) => { if (alive) setState({ products, loading: false, error: '' }) }).catch((error) => { if (alive) setState({ products: [], loading: false, error: error.message }) }); return () => { alive = false } }, [])
  return state
}
