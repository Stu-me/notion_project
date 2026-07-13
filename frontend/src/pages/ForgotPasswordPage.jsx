import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      setMessage(response.data.message || 'Check your email for reset instructions.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request a password reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-3">Reset your password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your email and we will send you a reset link.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <p className="text-sm mt-4 text-center">
          <Link to="/login" className="underline">Back to log in</Link>
        </p>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
