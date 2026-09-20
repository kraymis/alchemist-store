import { useEffect, useState } from 'react'
import { api } from './api'

export function useProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    api('/products')
      .then((products) => {
        if (alive) setState({ products: Array.isArray(products) ? products : [], loading: false, error: '' })
      })
      .catch((error) => {
        if (alive) setState((current) => ({ ...current, loading: false, error: error.message }))
      })
    return () => { alive = false }
  }, [attempt])
  return {
    ...state,
    retry: () => {
      setState((current) => ({ ...current, loading: true, error: '' }))
      setAttempt((current) => current + 1)
    },
  }
}
