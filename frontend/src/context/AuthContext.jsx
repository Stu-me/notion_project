import { useState } from 'react'
import AuthContext from './authContext'

// Restores a persistent "remember me" session first, then a tab-only session.
function getStoredSession() {
  const storageOptions = [localStorage, sessionStorage]

  for (const storage of storageOptions) {
    try {
      const token = storage.getItem('token')
      const storedUser = storage.getItem('user')
      if (token && storedUser) return { token, user: JSON.parse(storedUser) }
    } catch {
      storage.removeItem('token')
      storage.removeItem('user')
    }
  }

  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  // Stores a session permanently or only for the current browser tab based on Remember Me.
  const login = (userData, token, rememberMe = true) => {
    const user = { ...userData }
    delete user.token
    const targetStorage = rememberMe ? localStorage : sessionStorage
    const otherStorage = rememberMe ? sessionStorage : localStorage

    otherStorage.removeItem('token')
    otherStorage.removeItem('user')
    targetStorage.setItem('token', token)
    targetStorage.setItem('user', JSON.stringify(user))
    setSession({ token, user })
  }

  // Clears both storage types so logout always removes the active session.
  const logout = () => {
    setSession({ token: null, user: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...session, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}
