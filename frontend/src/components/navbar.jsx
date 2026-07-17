import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Toast from './Toast'
import ThemeToggle from './ThemeToggle'

// Reads and clears a one-time message saved before navigation, such as login feedback.
function getSavedToast() {
  try {
    const savedToast = sessionStorage.getItem('appToast')
    sessionStorage.removeItem('appToast')
    return savedToast ? JSON.parse(savedToast) : null
  } catch {
    sessionStorage.removeItem('appToast')
    return null
  }
}

function Navbar() {
  const { user, logout } = useAuth()
  const [toast, setToast] = useState(getSavedToast)

  return (
    <>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <nav className="flex items-center justify-between px-6 py-3 border-b border-[var(--nav-border)] bg-[var(--bg-nav)]">
      <Link to="/dashboard" className="font-bold text-lg text-[var(--text-primary)]">Notion Reinvent</Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && <span className="text-sm text-[var(--text-secondary)]">{user.name}</span>}
        <Link to="/subscribe" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition">Subscription</Link>
        {/* checks if the user is masterAdmin or not  */}
        {user?.role === 'masterAdmin' && <Link to="/admin/payments" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition">Admin</Link>}
        <button
          onClick={logout}
          className="text-sm bg-[var(--btn-secondary-bg)] text-[var(--text-primary)] px-3 py-1.5 rounded-xl hover:bg-[var(--border-light)] transition border border-[var(--nav-border)]"
        >
          Log out
        </button>
      </div>
      </nav>
    </>
  )
}

export default Navbar
