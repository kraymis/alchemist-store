import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export function MainLayout({ theme, onToggleTheme }) {
  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main className="route-content"><Outlet /></main>
      <Footer theme={theme} onToggleTheme={onToggleTheme} />
    </>
  )
}
