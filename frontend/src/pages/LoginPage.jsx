import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/authService'
import Toast from '../components/Toast'

// Decides where each authenticated role should land after login or a page refresh.
function getDestination(user) {
  return user?.role === 'masterAdmin' ? '/admin/payments' : '/dashboard'
}

// Validates one login field and returns a user-friendly message when invalid.
function validateField(name, value) {
  if (!value.trim()) return name === 'email' ? 'Please enter your email address.' : 'Please enter your password.'
  if (name === 'email' && !/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email address.'
  return ''
}

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Redirects an existing session away from login, including after a successful login request.
  useEffect(() => {
    if (user) navigate(getDestination(user), { replace: true })
  }, [navigate, user])

  // Updates field input and removes its validation message as the user corrects it.
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }))
    }
  }

  // Shows inline validation after a field loses focus.
  const handleBlur = (event) => {
    const { name, value } = event.target
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }))
  }

  // Validates credentials, saves the chosen session type, and lets the role redirect effect navigate.
  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    }
    setFieldErrors(nextErrors)

    if (nextErrors.email || nextErrors.password) {
      setToast({ type: 'error', message: 'Please fix the highlighted fields.' })
      return
    }

    setLoading(true)
    try {
      const response = await authService.login({ ...formData, rememberMe })
      sessionStorage.setItem('appToast', JSON.stringify({ type: 'success', message: 'Logged in successfully. Welcome back!' }))
      login(response.data, response.data.token, rememberMe)
    } catch (err) {
      const message = err.response?.status === 400 || err.response?.status === 401
        ? 'Email or password is incorrect.'
        : err.response?.data?.message || 'Unable to log in. Please try again.'
      setToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--accent-light),transparent_35%),radial-gradient(circle_at_bottom_right,_var(--accent-light),transparent_35%)]" />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-elevated)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden bg-[var(--btn-primary-bg)] p-10 text-[var(--text-on-accent)] lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-xl text-[var(--text-on-accent)]">🐼</div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)] opacity-90">Pandawrite</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Write your story.<br />Find your balance.</h1>
              <p className="mt-5 max-w-sm text-[var(--text-secondary)]">A mindful workspace for pages, notes, and the ideas that matter.</p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]/70">Inner peace starts with a single word.</p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-lg text-[var(--text-on-accent)]">🐼</div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Pandawrite</p>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Welcome back</p>
              <h2 className="mt-1 text-3xl font-bold text-[var(--text-primary)]">Sign in to your workspace</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter your details to continue.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)]">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`mt-2 w-full rounded-xl border px-3 py-3 outline-none transition focus:ring-4 ${fieldErrors.email ? 'border-red-400 focus:ring-red-100' : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-light)]'}`}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)]">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full rounded-xl border px-3 py-3 pr-12 outline-none transition focus:ring-4 ${fieldErrors.password ? 'border-red-400 focus:ring-red-100' : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-light)]'}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent-ring)]"
                />
                Remember me on this device
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--btn-primary-bg)] px-4 py-3 font-semibold text-[var(--text-on-accent)] transition hover:bg-[var(--btn-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--text-secondary)]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[var(--text-secondary)]">
              New here? <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
