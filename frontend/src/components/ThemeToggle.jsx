import { useTheme } from '../hooks/useTheme'

/**
 * ThemeToggle
 *
 * A minimal toggle switch that sits in the navigation bar.
 * Switches between the Claude light theme and the dark theme.
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors"
      style={{ backgroundColor: 'var(--toggle-bg)' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className="inline-block h-4 w-4 rounded-full transition-transform"
        style={{
          backgroundColor: 'var(--toggle-dot)',
          transform: isDark ? 'translateX(20px)' : 'translateX(3px)',
        }}
      >
        {/* Inline SVG icons — no extra dependencies */}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-full w-full p-0.5"
          style={{ color: isDark ? '#F4F3EE' : '#B1ADA1' }}
        >
          {isDark ? (
            /* Moon icon */
            <path
              d="M12.5 10a5.5 5.5 0 0 1-5.5-5.5c0-1.1.32-2.12.87-2.97A6.5 6.5 0 1 0 13.5 9.5c-.3.02-.66.03-1 .03z"
              fill="currentColor"
            />
          ) : (
            /* Sun icon */
            <circle cx="8" cy="8" r="3" fill="currentColor" />
          )}
        </svg>
      </span>
    </button>
  )
}

export default ThemeToggle
