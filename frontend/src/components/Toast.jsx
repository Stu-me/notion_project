import { useEffect } from 'react'

// Displays short success or error feedback without interrupting the user's work.
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onDismiss, 4000)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const colours = toast.type === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : 'border-red-200 bg-red-50 text-red-800'

  return (
    <div role="alert" className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg ${colours}`}>
      <div className="flex items-start gap-3">
        <span className="font-bold">{toast.type === 'success' ? '✓' : '!'}</span>
        <p className="text-sm font-medium">{toast.message}</p>
        <button onClick={onDismiss} className="ml-auto text-sm opacity-70 hover:opacity-100" aria-label="Dismiss notification">×</button>
      </div>
    </div>
  )
}

export default Toast
