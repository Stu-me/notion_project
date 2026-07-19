import { useEffect, useRef } from 'react'

/**
 * ConfirmModal
 *
 * A themed confirmation popup that replaces native browser confirm() dialogs.
 * Renders a translucent red backdrop with a spring-animated card in the center.
 *
 * Props:
 *   isOpen        — whether the modal is visible
 *   title         — heading text
 *   message       — descriptive body text
 *   confirmText   — label for the confirm button (default: "Delete")
 *   onConfirm     — callback when the user confirms
 *   onCancel      — callback when the user cancels or clicks backdrop
 *   variant       — "danger" (red) or "warning" (amber)
 */
function ConfirmModal({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, variant = 'danger' }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    // Focus the cancel button so Escape / Enter work intuitively
    cancelRef.current?.focus()

    // Close on Escape
    const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKey)

    // Prevent body scroll while open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div
      className="confirm-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <div
        className="confirm-card-enter relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar across the top */}
        <div
          className={`absolute inset-x-6 top-0 h-1 rounded-b-full ${isDanger ? 'bg-red-500/50' : 'bg-amber-500/50'}`}
        />

        {/* Warning icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isDanger ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        {/* Copy */}
        <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{message}</p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`ripple flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
