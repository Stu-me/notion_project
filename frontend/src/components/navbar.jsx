import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Toast from './Toast'
import ThemeToggle from './ThemeToggle'
import pandaLogo from '../assets/KungFuPanda.jpg'

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
      <nav className="flex items-center justify-between px-6 py-3 border-b border-(--nav-border) bg-(--bg-nav)">
      <Link to="/dashboard" className="flex items-center gap-3 font-bold text-lg transition hover:opacity-90">
        <img src={pandaLogo} alt="Pandawrite logo" className="h-10 w-10 rounded-full border border-(--border) bg-white object-cover shadow-sm" />
        <span className="text-(--logo-color) hover:text-(--logo-color-hover)">
          Pandawrite
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user && <span className="text-sm text-(--text-secondary)">{user.name}</span>}
        <Link to="/subscribe" className="text-sm text-(--text-secondary) hover:text-(--accent) transition">Subscription</Link>
        {/* checks if the user is masterAdmin or not  */}
        {user?.role === 'masterAdmin' && <Link to="/admin/payments" className="text-sm text-(--text-secondary) hover:text-(--accent) transition">Admin</Link>}
        <button
          onClick={logout}
          className="text-sm bg-(--btn-secondary-bg) text-(--text-primary) px-3 py-1.5 rounded-xl hover:bg-(--border-light) transition border border-(--nav-border)"
        >
          Log out
        </button>
      </div>
      </nav>
    </>
  )
}

export default Navbar
