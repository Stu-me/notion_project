import { useState } from 'react'
import AuthContext from './authContext'

function getStoredSession() {
  try {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (!token || !storedUser) return { token: null, user: null }

    return { token, user: JSON.parse(storedUser) }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  const login = (userData, token) => {
    const user = { ...userData }
    delete user.token
    setSession({ token, user })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setSession({ token: null, user: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}
