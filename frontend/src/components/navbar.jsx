import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Toast from './Toast'

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
      <nav className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <Link to="/dashboard" className="font-bold text-lg">Notion Reinvent</Link>

      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-gray-600">{user.name}</span>}
        <Link to="/subscribe" className="text-sm text-gray-600 hover:underline">Subscription</Link>
        {/* checks if the user is masterAdmin or not  */}
        {user?.role === 'masterAdmin' && <Link to="/admin/payments" className="text-sm text-gray-600 hover:underline">Admin</Link>}
        <button
          onClick={logout}
          className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
        >
          Log out
        </button>
      </div>
      </nav>
    </>
  )
}

export default Navbar
