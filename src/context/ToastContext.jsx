import { createContext, useCallback, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const dismiss = useCallback((id) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])
  const notify = useCallback((message, type = 'success') => {
    const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, message, type }].slice(-3))
    timers.current.set(id, window.setTimeout(() => dismiss(id), 3800))
  }, [dismiss])
  const value = useMemo(() => ({ notify }), [notify])
  return <ToastContext.Provider value={value}>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <div className={`toast toast-${toast.type}`} key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}><span>{toast.type === 'error' ? '!' : '✓'}</span><p>{toast.message}</p><button type="button" aria-label="Fermer la notification" onClick={() => dismiss(toast.id)}>×</button></div>)}</div></ToastContext.Provider>
}

export { ToastContext }
