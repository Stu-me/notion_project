import { useEffect, useState } from 'react'
import ThemeContext from './themeContext'

/**
 * ThemeContext
 *
 * Manages the active theme ('light' | 'dark') across the application.
 * - Persists the choice to localStorage so it survives reloads.
 * - Sets the `data-theme` attribute on <html> for CSS variable switching.
 * - Provides `theme` and a `toggleTheme` callback to all children.
 */
export function ThemeProvider({ children }) {
  // Initialise from localStorage, defaulting to 'light' (Claude theme).
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('app-theme') || 'light'
    } catch {
      return 'light'
    }
  })

  // Sync the data attribute and localStorage whenever the theme changes.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('app-theme', theme)
    } catch {
      /* storage may be unavailable — degrade gracefully */
    }
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
