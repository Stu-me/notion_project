import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <Link to="/dashboard" className="font-bold text-lg">Notion Clone</Link>

      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-gray-600">{user.name}</span>}
        <button
          onClick={logout}
          className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
        >
          Log out
        </button>
      </div>
    </nav>
  )
}

export default Navbar