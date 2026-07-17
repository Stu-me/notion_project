import { useCallback, useEffect, useState } from 'react'
import { adminService } from '../services/adminService'

// Formats dates from the API in the administrator's local timezone.
function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

// Applies a readable colour to each subscription or payment state.
function statusStyle(status) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-red-100 text-red-700',
    expired: 'bg-gray-200 text-gray-700',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

function AdminPaymentsPage() {
  const [paymentRequests, setPaymentRequests] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [rejectingId, setRejectingId] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Loads pending reviews and the current subscription list for the admin dashboard.
  const loadAdminData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [paymentsRes, subscriptionsRes] = await Promise.all([
        adminService.getPaymentRequests('pending'),
        adminService.getSubscriptions(),
      ])
      setPaymentRequests(paymentsRes.data)
      setSubscriptions(subscriptionsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // This starts asynchronous admin API calls after the page renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAdminData()
  }, [loadAdminData])

  // Approves a payment only after the admin has checked the actual bank/UPI transaction.
  const handleApprove = async (paymentId) => {
    if (!window.confirm('Confirm that you verified this payment in your bank or UPI account.')) return

    setActionLoadingId(paymentId)
    setError('')
    try {
      await adminService.approvePayment(paymentId)
      setMessage('Payment approved and subscription activated.')
      await loadAdminData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve payment')
    } finally {
      setActionLoadingId('')
    }
  }

  // Rejects a pending request while preserving the decision and optional reason in the audit history.
  const handleReject = async (paymentId) => {
    setActionLoadingId(paymentId)
    setError('')
    try {
      await adminService.rejectPayment(paymentId, rejectionReason)
      setRejectingId('')
      setRejectionReason('')
      setMessage('Payment request rejected.')
      await loadAdminData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reject payment')
    } finally {
      setActionLoadingId('')
    }
  }

  // Removes premium access without deleting the user, pages, or payment history.
  const handleSuspend = async (userId) => {
    if (!window.confirm('Suspend this subscription? The user will return to free-plan limits.')) return

    setActionLoadingId(userId)
    setError('')
    try {
      await adminService.suspendSubscription(userId)
      setMessage('Subscription suspended.')
      await loadAdminData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to suspend subscription')
    } finally {
      setActionLoadingId('')
    }
  }

  if (loading) return <div className="p-6 text-[var(--text-secondary)]">Loading admin dashboard...</div>

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8 bg-[var(--bg)] min-h-screen">
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Master admin</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment approvals</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Verify each transaction in your payment account before approving it.</p>
      </section>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Pending payment requests</h2>
        </div>
        {paymentRequests.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">No payment requests are waiting for review.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {paymentRequests.map((request) => (
              <article key={request._id} className="p-5 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{request.user?.name || 'Unknown user'} <span className="font-normal text-[var(--text-secondary)]">({request.user?.email})</span></p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)] capitalize">{request.plan} plan · ₹{request.amount}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Transaction ID: <span className="font-mono">{request.transactionId}</span></p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Submitted {formatDate(request.createdAt)}</p>
                    {request.proofUrl && (
                      <a href={request.proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-[var(--accent)] underline hover:text-[var(--accent-hover)] transition">
                        Open payment proof
                      </a>
                    )}
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyle(request.status)}`}>{request.status}</span>
                </div>

                {rejectingId === request._id ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Optional rejection reason"
                      className="flex-1 rounded-xl border border-[var(--border)] p-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition"
                    />
                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={actionLoadingId === request._id}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm text-[var(--text-on-accent)] font-semibold disabled:opacity-50 hover:bg-red-700 transition"
                    >
                      {actionLoadingId === request._id ? 'Rejecting...' : 'Confirm rejection'}
                    </button>
                    <button onClick={() => setRejectingId('')} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      disabled={actionLoadingId === request._id}
                      className="rounded-xl bg-[var(--btn-primary-bg)] px-5 py-2 text-sm text-[var(--text-on-accent)] font-semibold disabled:opacity-50 hover:bg-[var(--btn-primary-hover)] transition"
                    >
                      {actionLoadingId === request._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button onClick={() => setRejectingId(request._id)} className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition">
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Current subscriptions</h2>
        </div>
        {subscriptions.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">No active or historical subscriptions yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {subscriptions.map((subscription) => (
              <article key={subscription._id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{subscription.user?.name || 'Unknown user'} <span className="font-normal text-[var(--text-secondary)]">({subscription.user?.email})</span></p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)] capitalize">{subscription.plan} · Ends {formatDate(subscription.endsAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyle(subscription.status)}`}>{subscription.status}</span>
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => handleSuspend(subscription.user._id)}
                      disabled={actionLoadingId === subscription.user._id}
                      className="rounded-xl border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      {actionLoadingId === subscription.user._id ? 'Suspending...' : 'Suspend'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminPaymentsPage
