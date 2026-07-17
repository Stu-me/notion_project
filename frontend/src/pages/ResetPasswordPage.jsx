import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authService } from '../services/authService'

function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await authService.resetPassword(token, password)
      setMessage(response.data.message || 'Password reset successful. You can now log in.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] p-8 rounded-xl shadow-[var(--shadow-elevated)] w-full max-w-sm border border-[var(--border)]">
        <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Choose a new password</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          minLength={8}
          required
          className="w-full mb-3 p-2.5 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          minLength={8}
          required
          className="w-full mb-4 p-2.5 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--btn-primary-bg)] text-[var(--text-on-accent)] py-2.5 rounded-xl font-semibold transition hover:bg-[var(--btn-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--text-secondary)]/40 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>

        <p className="text-sm mt-4 text-center text-[var(--text-secondary)]">
          <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">Back to log in</Link>
        </p>
      </form>
    </div>
  )
}

export default ResetPasswordPage
