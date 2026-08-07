import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Toast from './Toast'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'
import UserAvatar from './UserAvatar'
import pandaLogo from '../assets/KungFuPanda.jpg'

// Reads and clears a one-time message saved before navigation, such as login feedback.
function getSavedToast() {
  try { const saved = sessionStorage.getItem('appToast'); sessionStorage.removeItem('appToast'); return saved ? JSON.parse(saved) : null } catch { return null }
}

// Renders the responsive product navigation and keeps account actions inside a compact profile menu.
function Navbar() {
  const { user, logout } = useAuth()
  const [toast, setToast] = useState(getSavedToast)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  // Keeps primary product pages visible in the desktop and mobile taskbar.
  const links = [{ to: '/dashboard', label: 'Dashboard' }, { to: '/subscribe', label: 'Subscription' }, { to: '/about', label: 'About' }]
  if (user?.role === 'masterAdmin') links.push({ to: '/admin/payments', label: 'Admin' })
  const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`

  return <>
    <Toast toast={toast} onDismiss={() => setToast(null)} />
    <nav className="sticky top-0 z-30 border-b border-[var(--nav-border)] bg-[var(--bg-nav)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-[var(--text-primary)]"><img src={pandaLogo} alt="Pandawrite" className="h-8 w-8 rounded-lg object-cover" /><span>Pandawrite</span></Link>
        <div className="hidden items-center gap-1 md:flex">{links.map((link) => <NavLink key={link.to} to={link.to} className={linkClass}>{link.label}</NavLink>)}</div>
        <div className="flex items-center gap-2"><ThemeToggle />
          <div className="relative hidden sm:block"><button onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--bg-hover)]" aria-expanded={profileOpen}><UserAvatar name={user?.name} className="h-8 w-8" /><Icon name="chevronDown" className="h-4 w-4 text-[var(--text-secondary)]" /></button>{profileOpen && <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-elevated)]"><p className="truncate px-2 py-2 text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p><p className="truncate px-2 pb-2 text-xs text-[var(--text-secondary)]">{user?.email}</p><button onClick={logout} className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Log out</button></div>}</div>
          <button onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] md:hidden" aria-label="Toggle menu"><Icon name={mobileOpen ? 'close' : 'menu'} /></button>
        </div>
      </div>
      {mobileOpen && <div className="border-t border-[var(--border)] px-4 py-3 md:hidden"><div className="flex flex-col gap-1">{links.map((link) => <NavLink key={link.to} onClick={() => setMobileOpen(false)} to={link.to} className={linkClass}>{link.label}</NavLink>)}<button onClick={logout} className="mt-1 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Log out</button></div></div>}
    </nav>
  </>
}

export default Navbar
