import { useContext } from 'react'
import ThemeContext from '../context/themeContext'

// Gives UI components safe access to the global light/dark theme controls.
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
