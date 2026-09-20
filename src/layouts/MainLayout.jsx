import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export function MainLayout({ theme, onToggleTheme }) {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main className="route-content"><Outlet /></main>
      <Footer theme={theme} onToggleTheme={onToggleTheme} />
    </>
  )
}
