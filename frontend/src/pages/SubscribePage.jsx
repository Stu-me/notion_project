import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { paymentService } from '../services/paymentService'
import { useSubscription } from '../hooks/useSubscription'

// Formats dates returned by MongoDB into a readable local date.
function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

// Gives each payment/subscription state a clear visual label.
function statusStyle(status) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-red-100 text-red-700',
    expired: 'bg-gray-200 text-gray-700',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

function SubscribePage() {
  const [searchParams] = useSearchParams()
  const { subscription, loading: subscriptionLoading, refreshSubscription } = useSubscription()
  const [plans, setPlans] = useState({})
  const [freeTier, setFreeTier] = useState(null)
  const [paymentRequests, setPaymentRequests] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [transactionId, setTransactionId] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(() => {
    if (searchParams.get('reason') !== 'free-limit') return ''
    const resource = searchParams.get('resource') || 'resource'
    const limit = searchParams.get('limit')
    return limit
      ? `You reached the free-plan limit of ${limit} ${resource}${limit === '1' ? '' : 's'}. Upgrade to create more.`
      : 'You reached a free-plan limit. Upgrade to create more.'
  })

  const paymentAccountName = import.meta.env.VITE_PAYMENT_RECEIVER_NAME || 'the app administrator'
  const paymentUpiId = import.meta.env.VITE_PAYMENT_UPI_ID

  // Loads plans and payment history; subscription state is cached in SubscriptionProvider.
  const loadSubscriptionData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [plansRes, requestsRes] = await Promise.all([
        paymentService.getPlans(),
        paymentService.getMyRequests(),
      ])
      const paidPlans = plansRes.data.paidPlans || plansRes.data
      setPlans(paidPlans)
      setFreeTier(plansRes.data.free || null)
      setPaymentRequests(requestsRes.data)

      if (!paidPlans[selectedPlan]) {
        setSelectedPlan(Object.keys(paidPlans)[0] || '')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load subscription information')
    } finally {
      setLoading(false)
    }
  }, [selectedPlan])

  useEffect(() => {
    // This starts asynchronous API requests; state changes happen after responses arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSubscriptionData()
  }, [loadSubscriptionData])

  const latestRequest = paymentRequests[0]
  const hasPendingRequest = latestRequest?.status === 'pending'
  const currentPlan = useMemo(() => plans[selectedPlan], [plans, selectedPlan])
  const hasActiveSubscription = subscription?.status === 'active'

  // Submits a transaction reference for manual verification; it never activates access directly.
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      await paymentService.createManualRequest({
        plan: selectedPlan,
        transactionId,
        proofUrl: proofUrl || undefined,
      })
      setTransactionId('')
      setProofUrl('')
      setMessage('Payment request submitted. Access will activate after admin verification.')
      await Promise.all([loadSubscriptionData(), refreshSubscription()])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit the payment request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || subscriptionLoading) return <div className="p-6 text-gray-500">Loading subscription options...</div>

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Subscription</p>
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="text-gray-600 mt-2">Pay manually, then submit the transaction reference for review.</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyle(hasActiveSubscription ? 'active' : 'free')}`}>
            {hasActiveSubscription ? 'active' : 'free'}
          </div>
      </section>

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {hasActiveSubscription && (
        <section className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">Your subscription is active.</p>
          <p className="text-sm mt-1">Access remains available until {formatDate(subscription.endsAt)}.</p>
        </section>
      )}

      {!hasActiveSubscription && freeTier && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <p className="font-semibold">You are currently using the Free plan.</p>
          <p className="text-sm mt-1">You can keep using the app within the limits shown below, or upgrade for unrestricted access.</p>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {freeTier && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-lg font-bold">{freeTier.name}</p>
            <p className="mt-2 text-3xl font-bold">₹0</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              <li>{freeTier.limits.workspaces} workspace</li>
              <li>{freeTier.limits.pagesPerWorkspace} pages per workspace</li>
              <li>{freeTier.limits.blocksPerPage} blocks per page</li>
              <li>All current block types</li>
            </ul>
          </div>
        )}
        {Object.entries(plans).map(([planName, plan]) => (
          <button
            type="button"
            key={planName}
            onClick={() => setSelectedPlan(planName)}
            className={`rounded-xl border p-5 text-left transition ${
              selectedPlan === planName ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <p className="text-lg font-bold capitalize">{planName}</p>
            <p className="mt-2 text-3xl font-bold">₹{plan.amount}</p>
            <p className="mt-1 text-sm text-gray-600">{plan.durationDays} days of access</p>
          </button>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-gray-50 p-5">
          <h2 className="text-lg font-bold">1. Make your payment</h2>
          <p className="mt-2 text-sm text-gray-600">Send ₹{currentPlan?.amount ?? '—'} to {paymentAccountName}.</p>
          {paymentUpiId ? (
            <p className="mt-3 rounded bg-white border p-3 font-mono text-sm">UPI ID: {paymentUpiId}</p>
          ) : (
            <p className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              Payment details have not been configured yet. Contact the administrator before submitting a request.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border p-5">
          <h2 className="text-lg font-bold">2. Submit payment for review</h2>
          <p className="mt-2 text-sm text-gray-600">The admin will verify the payment before activating access.</p>

          <label className="block mt-4 text-sm font-medium">Transaction/reference ID</label>
          <input
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            required
            disabled={hasPendingRequest || submitting}
            placeholder="Example: UPI transaction ID"
            className="mt-1 w-full rounded border p-2 disabled:bg-gray-100"
          />

          <label className="block mt-4 text-sm font-medium">Payment proof URL <span className="text-gray-400">(optional)</span></label>
          <input
            type="url"
            value={proofUrl}
            onChange={(event) => setProofUrl(event.target.value)}
            disabled={hasPendingRequest || submitting}
            placeholder="https://..."
            className="mt-1 w-full rounded border p-2 disabled:bg-gray-100"
          />

          {hasPendingRequest && <p className="mt-3 text-sm text-yellow-700">You already have a request waiting for review.</p>}

          <button
            type="submit"
            disabled={!currentPlan || hasPendingRequest || submitting}
            className="mt-5 w-full rounded bg-black py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : subscription?.status === 'active' ? 'Submit renewal request' : 'Submit payment request'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border overflow-hidden">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold">Payment history</h2>
        </div>
        {paymentRequests.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No payment requests submitted yet.</p>
        ) : (
          <div className="divide-y">
            {paymentRequests.map((request) => (
              <div key={request._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium capitalize">{request.plan} — ₹{request.amount}</p>
                  <p className="text-sm text-gray-500">Reference: {request.transactionId} · Submitted {formatDate(request.createdAt)}</p>
                  {request.rejectionReason && <p className="mt-1 text-sm text-red-600">Reason: {request.rejectionReason}</p>}
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyle(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default SubscribePage
